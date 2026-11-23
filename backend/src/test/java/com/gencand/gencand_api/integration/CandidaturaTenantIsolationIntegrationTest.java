package com.gencand.gencand_api.integration;

import com.gencand.gencand_api.entity.Candidatura;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@AutoConfigureMockMvc
class CandidaturaTenantIsolationIntegrationTest {

    @Container
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:18-alpine");

    @DynamicPropertySource
    static void configurarBanco(DynamicPropertyRegistry registry) {
        registry.add("DATABASE_URL", POSTGRES::getJdbcUrl);
        registry.add("DATABASE_USER", POSTGRES::getUsername);
        registry.add("DATABASE_PASSWORD", POSTGRES::getPassword);
        registry.add("JWT_SECRET", () -> "chave-de-teste-com-mais-de-32-caracteres");
        registry.add("FRONTEND_URL", () -> "http://localhost:5173");
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CandidaturaRepository candidaturaRepository;

    private Usuario usuarioA;
    private Usuario usuarioB;
    private Candidatura candidaturaDoUsuarioA;

    @BeforeEach
    void prepararDados() {
        candidaturaRepository.deleteAll();
        usuarioRepository.deleteAll();

        usuarioA = criarUsuario("usuario-a@teste.com");
        usuarioB = criarUsuario("usuario-b@teste.com");

        candidaturaDoUsuarioA = new Candidatura();
        candidaturaDoUsuarioA.setUsuario(usuarioA);
        candidaturaDoUsuarioA.setTitulo("Vaga privada do usuário A");
        candidaturaDoUsuarioA.setEmpresa("Empresa confidencial");
        candidaturaDoUsuarioA.setDataCandidatura(LocalDate.of(2026, 11, 1));
        candidaturaDoUsuarioA.setDataAtualizacao(Instant.now());
        candidaturaDoUsuarioA.setStatus("CANDIDATADA");
        candidaturaDoUsuarioA.setOculta(false);
        candidaturaDoUsuarioA = candidaturaRepository.saveAndFlush(candidaturaDoUsuarioA);
    }

    @Test
    void usuarioBnaoPodeListarConsultarAtualizarOuExcluirCandidaturaDoUsuarioA()
            throws Exception {
        String id = candidaturaDoUsuarioA.getId().toString();
        var autenticacaoUsuarioB = jwt().jwt(token ->
                token.subject(usuarioB.getId().toString()));

        mockMvc.perform(get("/api/candidaturas").with(autenticacaoUsuarioB))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Vaga privada do usuário A"))));

        mockMvc.perform(get("/api/candidaturas/{id}", id).with(autenticacaoUsuarioB))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/candidaturas/{id}", id)
                        .with(autenticacaoUsuarioB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Tentativa de alteração",
                                  "empresa": "Empresa invasora"
                                }
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/candidaturas/{id}/status", id)
                        .with(autenticacaoUsuarioB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PASSEI\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/candidaturas/{id}", id).with(autenticacaoUsuarioB))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString()))))
                .andExpect(status().isOk());
    }

    private Usuario criarUsuario(String email) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenhaHash("hash-de-teste");
        usuario.setEmailConfirmado(true);
        return usuarioRepository.saveAndFlush(usuario);
    }
}
