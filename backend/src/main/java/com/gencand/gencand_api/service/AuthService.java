package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.response.AuthResponse;
import com.gencand.gencand_api.entity.TokenUsuario;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.TokenUsuarioRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    public enum ResultadoRegistro { SOLICITACAO_RECEBIDA }

    private static final String HASH_SENHA_DUMMY =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    private static final String TIPO_CONFIRMACAO_EMAIL = "CONFIRMAR_EMAIL";
    private static final String TIPO_RECUPERACAO_SENHA = "RECUPERAR_SENHA";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final TokenUsuarioRepository tokenUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.jwt.expiracao-minutos:60}")
    private long expiracaoMinutos;

    @Value("${app.auth.confirmacao.max-reenvios-por-hora:3}")
    private long maxReenviosPorHora = 3;

    @Value("${app.auth.recuperacao.max-solicitacoes-por-hora:3}")
    private long maxSolicitacoesRecuperacaoPorHora = 3;

    @Transactional
    public ResultadoRegistro registrar(String email, String senha) {
        String emailNormalizado = normalizarEmail(email);
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailNormalizado).orElse(null);

        if (usuario == null) {
            usuario = new Usuario();
            usuario.setEmail(emailNormalizado);
            usuario.setSenhaHash(passwordEncoder.encode(senha));
            usuario.setEmailConfirmado(false);
            usuario = usuarioRepository.saveAndFlush(usuario);
            criarTokenEAgendarEmail(usuario, TIPO_CONFIRMACAO_EMAIL);
        } else {
            // Mantém custo de BCrypt semelhante ao caminho de criação e não revela
            // se a conta existe; nunca substitui a senha já cadastrada.
            passwordEncoder.matches("gencand-cadastro", HASH_SENHA_DUMMY);
            if (!Boolean.TRUE.equals(usuario.getEmailConfirmado())) {
                agendarConfirmacaoSeDentroDoLimite(usuario);
            }
        }

        return ResultadoRegistro.SOLICITACAO_RECEBIDA;
    }

    @Transactional
    public void reenviarConfirmacao(String email) {
        passwordEncoder.matches("gencand-reenvio", HASH_SENHA_DUMMY);
        usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email))
                .filter(usuario -> !Boolean.TRUE.equals(usuario.getEmailConfirmado()))
                .ifPresent(this::agendarConfirmacaoSeDentroDoLimite);
    }

    private void agendarConfirmacaoSeDentroDoLimite(Usuario usuario) {
        Instant limite = Instant.now().minus(Duration.ofHours(1));
        long enviosRecentes = tokenUsuarioRepository
                .countByUsuarioIdAndTipoAndCriadoEmAfter(
                        usuario.getId(), TIPO_CONFIRMACAO_EMAIL, limite);
        // Um envio inicial + no máximo maxReenviosPorHora reenvios.
        if (enviosRecentes <= maxReenviosPorHora) {
            criarTokenEAgendarEmail(usuario, TIPO_CONFIRMACAO_EMAIL);
        }
    }

    @Transactional
    public void confirmarEmail(String tokenEmTexto) {
        TokenUsuario token = buscarTokenValido(tokenEmTexto, TIPO_CONFIRMACAO_EMAIL);
        Usuario usuario = token.getUsuario();
        usuario.setEmailConfirmado(true);
        token.setUsado(true);
        usuarioRepository.save(usuario);
        tokenUsuarioRepository.save(token);
    }

    @Transactional
    public void solicitarRecuperacaoSenha(String email) {
        passwordEncoder.matches("gencand-recuperacao", HASH_SENHA_DUMMY);
        usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email)).ifPresent(usuario -> {
            Instant limite = Instant.now().minus(Duration.ofHours(1));
            long solicitacoes = tokenUsuarioRepository
                    .countByUsuarioIdAndTipoAndCriadoEmAfter(
                            usuario.getId(), TIPO_RECUPERACAO_SENHA, limite);
            if (solicitacoes < maxSolicitacoesRecuperacaoPorHora) {
                criarTokenEAgendarRecuperacao(usuario);
            }
        });
    }

    @Transactional
    public void redefinirSenha(String tokenEmTexto, String novaSenha) {
        TokenUsuario token = buscarTokenValido(tokenEmTexto, TIPO_RECUPERACAO_SENHA);
        Usuario usuario = token.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        // O link de recuperação enviado ao endereço comprova sua posse.
        usuario.setEmailConfirmado(true);
        token.setUsado(true);
        usuarioRepository.save(usuario);
        tokenUsuarioRepository.save(token);
        invalidarTokensAnteriores(usuario, TIPO_RECUPERACAO_SENHA);
    }

    private TokenUsuario buscarTokenValido(String tokenEmTexto, String tipo) {
        TokenUsuario token = tokenUsuarioRepository.findByTokenHash(hashToken(tokenEmTexto))
                .orElseThrow(() -> tokenInvalido());
        if (!tipo.equals(token.getTipo())
                || Boolean.TRUE.equals(token.getUsado())
                || token.getExpiraEm() == null
                || !token.getExpiraEm().isAfter(Instant.now())) {
            throw tokenInvalido();
        }
        return token;
    }

    private ResponseStatusException tokenInvalido() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Link inválido ou expirado");
    }

    @Transactional(readOnly = true)
    public AuthResponse autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email)).orElse(null);
        String hashArmazenado = usuario != null ? usuario.getSenhaHash() : HASH_SENHA_DUMMY;
        boolean senhaValida = passwordEncoder.matches(senha, hashArmazenado);

        if (usuario == null || !senhaValida) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }
        if (!Boolean.TRUE.equals(usuario.getEmailConfirmado())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Confirme seu e-mail antes de entrar");
        }

        Instant agora = Instant.now();
        Instant expiracao = agora.plusSeconds(expiracaoMinutos * 60);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("gencand-api")
                .issuedAt(agora)
                .expiresAt(expiracao)
                .subject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, "Bearer", expiracaoMinutos * 60);
    }

    private void criarTokenEAgendarEmail(Usuario usuario, String tipo) {
        String tokenEmTexto = gerarToken();
        invalidarTokensAnteriores(usuario, tipo);

        TokenUsuario token = new TokenUsuario();
        token.setUsuario(usuario);
        token.setTipo(tipo);
        token.setTokenHash(hashToken(tokenEmTexto));
        token.setCriadoEm(Instant.now());
        token.setExpiraEm(Instant.now().plus(Duration.ofHours(24)));
        token.setUsado(false);
        tokenUsuarioRepository.save(token);
        eventPublisher.publishEvent(new EmailConfirmacaoSolicitadoEvent(
                usuario.getEmail(), tokenEmTexto));
    }

    private void criarTokenEAgendarRecuperacao(Usuario usuario) {
        String tokenEmTexto = gerarToken();
        invalidarTokensAnteriores(usuario, TIPO_RECUPERACAO_SENHA);
        TokenUsuario token = new TokenUsuario();
        token.setUsuario(usuario);
        token.setTipo(TIPO_RECUPERACAO_SENHA);
        token.setTokenHash(hashToken(tokenEmTexto));
        token.setCriadoEm(Instant.now());
        token.setExpiraEm(Instant.now().plus(Duration.ofMinutes(15)));
        token.setUsado(false);
        tokenUsuarioRepository.save(token);
        eventPublisher.publishEvent(new EmailRecuperacaoSenhaSolicitadoEvent(
                usuario.getEmail(), tokenEmTexto));
    }

    private void invalidarTokensAnteriores(Usuario usuario, String tipo) {
        var anteriores = tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                usuario.getId(), tipo);
        anteriores.forEach(token -> token.setUsado(true));
        tokenUsuarioRepository.saveAll(anteriores);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String gerarToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não está disponível", e);
        }
    }
}
