package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.request.CandidaturaAtualizacaoRequest;
import com.gencand.gencand_api.entity.Candidatura;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import com.gencand.gencand_api.repository.HistoricoStatusRepository;
import com.gencand.gencand_api.repository.PlataformaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidaturaServiceTest {

    @Mock private CandidaturaRepository candidaturaRepository;
    @Mock private PlataformaRepository plataformaRepository;
    @Mock private HistoricoStatusRepository historicoStatusRepository;
    @Mock private UsuarioService usuarioService;

    private CandidaturaService candidaturaService;

    @BeforeEach
    void setUp() {
        candidaturaService = new CandidaturaService(
                candidaturaRepository,
                plataformaRepository,
                historicoStatusRepository,
                usuarioService);
    }

    @Test
    void putDevePreservarStatusAtualDaCandidatura() {
        UUID candidaturaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();

        Candidatura candidatura = new Candidatura();
        candidatura.setTitulo("Desenvolvedora Java");
        candidatura.setEmpresa("Empresa anterior");
        candidatura.setStatus("CANDIDATADA");
        candidatura.setDataAtualizacao(Instant.parse("2026-10-10T10:00:00Z"));
        candidatura.setDataCandidatura(LocalDate.of(2026, 10, 10));

        when(candidaturaRepository.findByIdAndUsuarioId(candidaturaId, usuarioId))
                .thenReturn(Optional.of(candidatura));
        when(candidaturaRepository.save(any(Candidatura.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CandidaturaAtualizacaoRequest request = new CandidaturaAtualizacaoRequest(
                "Desenvolvedora Backend",
                "Nova empresa",
                null,
                null,
                LocalDate.of(2026, 10, 12),
                "Atualização dos dados da vaga");

        var resposta = candidaturaService.atualizar(candidaturaId, request, usuarioId);

        assertEquals("CANDIDATADA", candidatura.getStatus());
        assertEquals("CANDIDATADA", resposta.status());
        assertEquals("Nova empresa", resposta.empresa());
        org.junit.jupiter.api.Assertions.assertTrue(
                candidatura.getDataAtualizacao().isAfter(Instant.parse("2026-10-10T10:00:00Z")));
        assertEquals(candidatura.getDataAtualizacao(), resposta.dataAtualizacao());
        verify(historicoStatusRepository, never()).save(any());
    }
}
