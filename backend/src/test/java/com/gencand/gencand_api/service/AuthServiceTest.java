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
    void cadastroExistenteNaoDeveCriarNovoTokenNemAgendarEmail() {
        when(usuarioRepository.existsByEmailIgnoreCase("existente@exemplo.com"))
                .thenReturn(true);

        authService.registrar("Existente@Exemplo.com", "senha-segura");

        verify(usuarioRepository, never()).save(any());
        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }

    @Test
    void reenvioDeveAgendarNovoEmailParaCadastroPendente() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setEmail("pendente@exemplo.com");
        usuario.setEmailConfirmado(false);

        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com"))
                .thenReturn(Optional.of(usuario));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(usuarioId), eq("CONFIRMAR_EMAIL"), any()))
                .thenReturn(1L);
        when(tokenUsuarioRepository.findByUsuarioIdAndTipoAndUsadoFalse(
                usuarioId, "CONFIRMAR_EMAIL"))
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
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        usuario.setEmail("pendente@exemplo.com");
        usuario.setEmailConfirmado(false);

        when(usuarioRepository.findByEmailIgnoreCase("pendente@exemplo.com"))
                .thenReturn(Optional.of(usuario));
        when(tokenUsuarioRepository.countByUsuarioIdAndTipoAndCriadoEmAfter(
                eq(usuarioId), eq("CONFIRMAR_EMAIL"), any()))
                .thenReturn(4L);

        authService.reenviarConfirmacao("pendente@exemplo.com");

        verify(tokenUsuarioRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(EmailConfirmacaoSolicitadoEvent.class));
    }
}
