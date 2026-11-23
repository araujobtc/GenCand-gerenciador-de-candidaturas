package com.gencand.gencand_api.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gencand.gencand_api.entity.Candidatura;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
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
    @Autowired private ObjectMapper objectMapper;
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

        mockMvc.perform(get("/api/candidaturas")
                        .with(jwt().jwt(token -> token.subject(usuarioB.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Vaga privada do usuário A"))));

        mockMvc.perform(get("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioB.getId().toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioB.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Tentativa de alteração",
                                  "empresa": "Empresa invasora"
                                }
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/candidaturas/{id}/status", id)
                        .with(jwt().jwt(token -> token.subject(usuarioB.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PASSEI\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioB.getId().toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString()))))
                .andExpect(status().isOk());
    }

    @Test
    void crudDevePreservarStatusNoPutEAlterarStatusSomenteNoPatch()
            throws Exception {
        String jsonCriacao = """
                {
                  "titulo": "Desenvolvedora Java",
                  "empresa": "Empresa de teste",
                  "status": "CANDIDATADA"
                }
                """;

        MvcResult criacao = mockMvc.perform(post("/api/candidaturas")
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCriacao))
                .andExpect(status().isCreated())
                .andReturn();

        String id = objectMapper.readTree(criacao.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(get("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANDIDATADA"));

        mockMvc.perform(put("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Desenvolvedora Backend",
                                  "empresa": "Empresa atualizada",
                                  "observacao": "Dados revisados"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANDIDATADA"));

        mockMvc.perform(patch("/api/candidaturas/{id}/status", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PASSEI\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PASSEI"));

        mockMvc.perform(delete("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString()))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/candidaturas/{id}", id)
                        .with(jwt().jwt(token -> token.subject(usuarioA.getId().toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void endpointsDeAutenticacaoDevemTratarRegistroReenvioConfirmacaoELogin()
            throws Exception {
        String email = "novo-cadastro@teste.com";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "novo-cadastro@teste.com",
                                  "senha": "senha-segura"
                                }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.mensagem").exists());

        org.junit.jupiter.api.Assertions.assertTrue(
                usuarioRepository.findByEmailIgnoreCase(email).isPresent());

        mockMvc.perform(post("/api/auth/resend-confirmation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "novo-cadastro@teste.com"
                                }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.mensagem").exists());

        mockMvc.perform(post("/api/auth/confirm-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"token-invalido\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "novo-cadastro@teste.com",
                                  "senha": "senha-segura"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    private Usuario criarUsuario(String email) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenhaHash("hash-de-teste");
        usuario.setEmailConfirmado(true);
        return usuarioRepository.saveAndFlush(usuario);
    }
}
