package com.gencand.gencand_api.service;

import com.gencand.gencand_api.repository.TokenUsuarioRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private TokenUsuarioRepository tokenUsuarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtEncoder jwtEncoder;
    @Mock private BrevoEmailService brevoEmailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                usuarioRepository,
                tokenUsuarioRepository,
                passwordEncoder,
                jwtEncoder,
                brevoEmailService);
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
}
