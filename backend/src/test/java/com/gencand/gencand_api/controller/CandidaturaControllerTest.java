package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.response.CandidaturaResponse;
import com.gencand.gencand_api.service.CandidaturaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidaturaControllerTest {

    @Mock
    private CandidaturaService candidaturaService;

    private CandidaturaController controller;

    @BeforeEach
    void setUp() {
        controller = new CandidaturaController(candidaturaService);
    }

    @Test
    void deveRejeitarCampoDeOrdenacaoForaDaListaPermitida() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 20, Sort.by("campoInexistente"));

        assertThrows(ResponseStatusException.class,
                () -> controller.listar(usuarioId, pageable));

        verifyNoInteractions(candidaturaService);
    }

    @Test
    void deveAceitarCamposDeOrdenacaoPermitidos() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 20,
                Sort.by(Sort.Order.desc("dataCandidatura"), Sort.Order.asc("empresa")));
        when(candidaturaService.listar(eq(usuarioId), any(Pageable.class)))
                .thenReturn(Page.<CandidaturaResponse>empty());

        controller.listar(usuarioId, pageable);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(candidaturaService).listar(eq(usuarioId), pageableCaptor.capture());
        assertEquals(pageable.getSort(), pageableCaptor.getValue().getSort());
    }

    @Test
    void deveLimitarTamanhoDaPaginaA100Registros() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 250, Sort.by("empresa"));
        when(candidaturaService.listar(eq(usuarioId), any(Pageable.class)))
                .thenReturn(Page.<CandidaturaResponse>empty());

        controller.listar(usuarioId, pageable);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(candidaturaService).listar(eq(usuarioId), pageableCaptor.capture());
        assertEquals(100, pageableCaptor.getValue().getPageSize());
    }
}
