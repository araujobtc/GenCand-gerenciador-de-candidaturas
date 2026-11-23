package com.gencand.gencand_api.service;

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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
        authService = new AuthService(
                usuarioRepository,
                tokenUsuarioRepository,
                passwordEncoder,
                jwtEncoder,
                eventPublisher);
    }

    @Test
    void loginDeveExecutarBcryptMesmoQuandoEmailNaoExiste() {
        when(usuarioRepository.findByEmailIgnoreCase("inexistente@exemplo.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.matches(eq("senha-incorreta"), anyString()))
                .thenReturn(false);

        assertThrows(BadCredentialsException.class, () ->
                authService.autenticar("inexistente@exemplo.com", "senha-incorreta"));

        verify(passwordEncoder).matches(eq("senha-incorreta"), anyString());
    }

    @Test
    void cadastroNovoDeveCriarContaProntaParaLoginSemEnviarConfirmacao() {
        when(usuarioRepository.findByEmailIgnoreCase("novo@exemplo.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha-original")).thenReturn("hash-original");
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocacao -> invocacao.getArgument(0));

        AuthService.ResultadoRegistro resultado =
                authService.registrar("Novo@Exemplo.com", "senha-original");

        assertEquals(AuthService.ResultadoRegistro.CRIADO, resultado);
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        assertEquals("novo@exemplo.com", usuarioCaptor.getValue().getEmail());
        assertEquals("hash-original", usuarioCaptor.getValue().getSenhaHash());
        assertFalse(usuarioCaptor.getValue().getEmailConfirmado());
        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }

    @Test
    void cadastroComEmailJaConfirmadoDeveInformarContaExistenteSemAlterarDados() {
        Usuario usuario = usuario("existente@exemplo.com", true);

        when(usuarioRepository.findByEmailIgnoreCase("existente@exemplo.com"))
                .thenReturn(Optional.of(usuario));

        AuthService.ResultadoRegistro resultado =
                authService.registrar("Existente@Exemplo.com", "senha-de-atacante");

        assertEquals(AuthService.ResultadoRegistro.JA_CADASTRADO, resultado);
        verificarNenhumaAlteracaoDeConta();
    }

    @Test
    void cadastroComEmailExistenteAindaNaoConfirmadoDevePermitirLoginSemAlterarSenha() {
        Usuario usuario = usuario("pendente@exemplo.com", false);
        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com"))
                .thenReturn(Optional.of(usuario));

        AuthService.ResultadoRegistro resultado =
                authService.registrar("Pendente@Exemplo.com", "senha-de-atacante");

        assertEquals(AuthService.ResultadoRegistro.JA_CADASTRADO, resultado);
        verificarNenhumaAlteracaoDeConta();
    }

    @Test
    void reenvioDeveAgendarNovoEmailParaCadastroPendente() {
        Usuario usuario = usuario("pendente@exemplo.com", false);

        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com"))
                .thenReturn(Optional.of(usuario));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(usuario.getId()), eq("CONFIRMAR_EMAIL"), any()))
                .thenReturn(1L);
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                usuario.getId(), "CONFIRMAR_EMAIL"))
                .thenReturn(List.of());

        authService.reenviarConfirmacao("Pendente@Exemplo.com");

        verify(tokenUsuarioRepository).save(any());
        ArgumentCaptor<EmailConfirmacaoSolicitadoEvent> evento =
                ArgumentCaptor.forClass(EmailConfirmacaoSolicitadoEvent.class);
        verify(eventPublisher).publishEvent(evento.capture());
        assertEquals("pendente@exemplo.com", evento.getValue().destinatario());
        assertTrue(!evento.getValue().token().isBlank());
    }

    @Test
    void reenvioDeveRespeitarLimitePorHora() {
        Usuario usuario = usuario("pendente@exemplo.com", false);

        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com"))
                .thenReturn(Optional.of(usuario));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(usuario.getId()), eq("CONFIRMAR_EMAIL"), any()))
                .thenReturn(4L);

        authService.reenviarConfirmacao("pendente@exemplo.com");

        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }

    private Usuario usuario(String email, boolean confirmado) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setEmail(email);
        usuario.setEmailConfirmado(confirmado);
        usuario.setSenhaHash("hash-ja-existente");
        return usuario;
    }

    private void verificarNenhumaAlteracaoDeConta() {
        verify(usuarioRepository, never()).save(any());
        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}
