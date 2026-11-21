package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.response.AuthResponse;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    @Value("${app.jwt.expiracao-minutos:60}")
    private long expiracaoMinutos;

    @Transactional(readOnly = true)
    public AuthResponse autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos"));

        if (!Boolean.TRUE.equals(usuario.getEmailConfirmado())
                || !passwordEncoder.matches(senha, usuario.getSenhaHash())) {
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
}
