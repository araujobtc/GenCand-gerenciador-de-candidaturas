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

    private static final String HASH_SENHA_DUMMY =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    private static final String TIPO_CONFIRMACAO_EMAIL = "CONFIRMAR_EMAIL";
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

    @Transactional
    public void registrar(String email, String senha) {
        String emailNormalizado = normalizarEmail(email);

        // Mantém uma resposta externa genérica para não revelar contas existentes.
        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(emailNormalizado);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setEmailConfirmado(false);
        Usuario salvo = usuarioRepository.save(usuario);

        criarTokenEAgendarEmail(salvo);
    }

    @Transactional
    public void reenviarConfirmacao(String email) {
        usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email))
                .filter(usuario -> !Boolean.TRUE.equals(usuario.getEmailConfirmado()))
                .ifPresent(usuario -> {
                    Instant limite = Instant.now().minus(Duration.ofHours(1));
                    long reenviosRecentes = tokenUsuarioRepository
                            .countByUsuarioIdAndTipoAndCriadoEmAfter(
                                    usuario.getId(), TIPO_CONFIRMACAO_EMAIL, limite);

                    if (reenviosRecentes < maxReenviosPorHora) {
                        criarTokenEAgendarEmail(usuario);
                    }
                });
    }

    @Transactional
    public void confirmarEmail(String tokenEmTexto) {
        TokenUsuario token = tokenUsuarioRepository.findByTokenHash(hashToken(tokenEmTexto))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Link de confirmação inválido ou expirado"));

        if (!TIPO_CONFIRMACAO_EMAIL.equals(token.getTipo())
                || Boolean.TRUE.equals(token.getUsado())
                || token.getExpiraEm() == null
                || !token.getExpiraEm().isAfter(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Link de confirmação inválido ou expirado");
        }

        Usuario usuario = token.getUsuario();
        usuario.setEmailConfirmado(true);
        token.setUsado(true);
        usuarioRepository.save(usuario);
        tokenUsuarioRepository.save(token);
    }

    @Transactional(readOnly = true)
    public AuthResponse autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email)).orElse(null);

        // Sempre executa BCrypt, inclusive quando a conta não existe ou ainda não foi confirmada.
        String hashArmazenado = usuario != null ? usuario.getSenhaHash() : HASH_SENHA_DUMMY;
        boolean senhaValida = passwordEncoder.matches(senha, hashArmazenado);

        if (usuario == null
                || !Boolean.TRUE.equals(usuario.getEmailConfirmado())
                || !senhaValida) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
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

    private void criarTokenEAgendarEmail(Usuario usuario) {
        String tokenEmTexto = gerarToken();
        invalidarTokensAnteriores(usuario);

        TokenUsuario token = new TokenUsuario();
        token.setUsuario(usuario);
        token.setTipo(TIPO_CONFIRMACAO_EMAIL);
        token.setTokenHash(hashToken(tokenEmTexto));
        token.setCriadoEm(Instant.now());
        token.setExpiraEm(Instant.now().plus(Duration.ofHours(24)));
        token.setUsado(false);
        tokenUsuarioRepository.save(token);

        // O listener envia somente depois do commit, em outra thread.
        eventPublisher.publishEvent(new EmailConfirmacaoSolicitadoEvent(
                usuario.getEmail(), tokenEmTexto));
    }

    private void invalidarTokensAnteriores(Usuario usuario) {
        var anteriores = tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                usuario.getId(), TIPO_CONFIRMACAO_EMAIL);
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
