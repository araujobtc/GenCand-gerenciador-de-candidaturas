package com.gencand.gencand_api.service;

import com.gencand.gencand_api.entity.TokenUsuario;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.TokenUsuarioRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.Instant;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private TokenUsuarioRepository tokenUsuarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtEncoder jwtEncoder;
    @Mock private ApplicationEventPublisher eventPublisher;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(usuarioRepository, tokenUsuarioRepository,
                passwordEncoder, jwtEncoder, eventPublisher);
    }

    @Test
    void cadastroNovoCriaTokenEAgendaConfirmacao() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findByEmailIgnoreCase("novo@exemplo.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha-original")).thenReturn("hash-original");
        when(usuarioRepository.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setId(id);
            return u;
        });
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(id, "CONFIRMAR_EMAIL"))
                .thenReturn(List.of());

        assertEquals(AuthService.ResultadoRegistro.SOLICITACAO_RECEBIDA,
                authService.registrar("Novo@Exemplo.com", "senha-original"));

        ArgumentCaptor<Usuario> usuario = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).saveAndFlush(usuario.capture());
        assertEquals("novo@exemplo.com", usuario.getValue().getEmail());
        assertFalse(usuario.getValue().getEmailConfirmado());
        verify(tokenUsuarioRepository).save(any(TokenUsuario.class));
        verify(eventPublisher).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }

    @Test
    void cadastroExistenteNaoRevelaContaNemSubstituiSenha() {
        Usuario existente = usuario("existente@exemplo.com", true);
        when(usuarioRepository.findByEmailIgnoreCase("existente@exemplo.com"))
                .thenReturn(Optional.of(existente));

        assertEquals(AuthService.ResultadoRegistro.SOLICITACAO_RECEBIDA,
                authService.registrar("Existente@Exemplo.com", "senha-de-atacante"));

        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
        verify(passwordEncoder).matches(eq("gencand-cadastro"), anyString());
        verify(eventPublisher, never()).publishEvent(any(Object.class));
    }

    @Test
    void cadastroPendentePodeSolicitarReenvioSemAlterarSenha() {
        Usuario pendente = usuario("pendente@exemplo.com", false);
        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com")).thenReturn(Optional.of(pendente));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(pendente.getId()), eq("CONFIRMAR_EMAIL"), any())).thenReturn(1L);
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                pendente.getId(), "CONFIRMAR_EMAIL")).thenReturn(List.of());

        authService.registrar("Pendente@Exemplo.com", "senha-de-atacante");

        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
        verify(passwordEncoder).matches(eq("gencand-cadastro"), anyString());
        verify(tokenUsuarioRepository).save(any(TokenUsuario.class));
        verify(eventPublisher).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }

    @Test
    void reenvioRespeitaLimiteDeTresReenviosAlemDoInicial() {
        Usuario pendente = usuario("pendente@exemplo.com", false);
        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com")).thenReturn(Optional.of(pendente));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(pendente.getId()), eq("CONFIRMAR_EMAIL"), any())).thenReturn(4L);

        authService.reenviarConfirmacao("pendente@exemplo.com");

        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(Object.class));
    }

    @Test
    void loginDeveBloquearContaAindaNaoConfirmadaMesmoComSenhaCorreta() {
        Usuario pendente = usuario("pendente@exemplo.com", false);
        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com")).thenReturn(Optional.of(pendente));
        when(passwordEncoder.matches("senha-correta", "hash")).thenReturn(true);

        ResponseStatusException erro = assertThrows(ResponseStatusException.class,
                () -> authService.autenticar("pendente@exemplo.com", "senha-correta"));
        assertEquals(403, erro.getStatusCode().value());
    }

    @Test
    void loginExecutaBcryptQuandoContaNaoExiste() {
        when(usuarioRepository.findByEmailIgnoreCase("inexistente@exemplo.com")).thenReturn(Optional.empty());
        when(passwordEncoder.matches(eq("senha"), anyString())).thenReturn(false);
        assertThrows(BadCredentialsException.class,
                () -> authService.autenticar("inexistente@exemplo.com", "senha"));
        verify(passwordEncoder).matches(eq("senha"), anyString());
    }

    @Test
    void redefinicaoDeSenhaConsomeTokenEConfirmaEndereco() throws Exception {
        String textoToken = "token-de-recuperacao";
        Usuario usuario = usuario("titular@exemplo.com", false);
        TokenUsuario token = new TokenUsuario();
        token.setUsuario(usuario);
        token.setTipo("RECUPERAR_SENHA");
        token.setTokenHash(hash(textoToken));
        token.setExpiraEm(Instant.now().plusSeconds(3600));
        token.setUsado(false);

        when(tokenUsuarioRepository.findByTokenHash(hash(textoToken))).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("nova-senha")).thenReturn("hash-novo");
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                usuario.getId(), "RECUPERAR_SENHA")).thenReturn(List.of());

        authService.redefinirSenha(textoToken, "nova-senha");

        assertEquals("hash-novo", usuario.getSenhaHash());
        assertTrue(usuario.getEmailConfirmado());
        assertTrue(token.getUsado());
        verify(usuarioRepository).save(usuario);
        verify(tokenUsuarioRepository).save(token);
    }

    @Test
    void solicitacaoRecuperacaoDeContaInexistenteNaoPublicaEvento() {
        when(usuarioRepository.findByEmailIgnoreCase("inexistente@exemplo.com")).thenReturn(Optional.empty());
        when(passwordEncoder.matches(eq("gencand-recuperacao"), anyString())).thenReturn(false);

        authService.solicitarRecuperacaoSenha("inexistente@exemplo.com");

        verify(eventPublisher, never()).publishEvent(any(Object.class));
    }

    @Test
    void solicitacaoRecuperacaoCriaTokenComValidadeDeQuinzeMinutos() {
        Usuario titular = usuario("titular@exemplo.com", true);
        when(usuarioRepository.findByEmailIgnoreCase("titular@exemplo.com"))
                .thenReturn(Optional.of(titular));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(titular.getId()), eq("RECUPERAR_SENHA"), any())).thenReturn(0L);
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                titular.getId(), "RECUPERAR_SENHA")).thenReturn(List.of());

        Instant inicio = Instant.now();
        authService.solicitarRecuperacaoSenha("titular@exemplo.com");

        ArgumentCaptor<TokenUsuario> captor = ArgumentCaptor.forClass(TokenUsuario.class);
        verify(tokenUsuarioRepository).save(captor.capture());
        Instant expiraEm = captor.getValue().getExpiraEm();
        assertNotNull(expiraEm);
        assertFalse(expiraEm.isBefore(inicio.plusSeconds(15 * 60 - 2)));
        assertFalse(expiraEm.isAfter(Instant.now().plusSeconds(15 * 60 + 2)));
        verify(eventPublisher).publishEvent(any(EmailRecuperacaoSenhaSolicitadoEvent.class));
    }

    private String hash(String token) throws NoSuchAlgorithmException {
        byte[] bytes = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }

    private Usuario usuario(String email, boolean confirmado) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setEmail(email);
        usuario.setEmailConfirmado(confirmado);
        usuario.setSenhaHash("hash");
        return usuario;
    }
}
