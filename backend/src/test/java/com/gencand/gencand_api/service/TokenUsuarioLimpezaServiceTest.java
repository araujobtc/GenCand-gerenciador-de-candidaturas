package com.gencand.gencand_api.service;

import com.gencand.gencand_api.repository.TokenUsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TokenUsuarioLimpezaServiceTest {

    @Mock
    private TokenUsuarioRepository tokenUsuarioRepository;

    private TokenUsuarioLimpezaService limpezaService;

    @BeforeEach
    void setUp() {
        limpezaService = new TokenUsuarioLimpezaService(tokenUsuarioRepository);
    }

    @Test
    void deveExecutarLimpezaDiariamenteAsTresHorasUtc() throws NoSuchMethodException {
        Scheduled agendamento = TokenUsuarioLimpezaService.class
                .getMethod("removerTokensExpirados")
                .getAnnotation(Scheduled.class);

        org.junit.jupiter.api.Assertions.assertNotNull(agendamento);
        org.junit.jupiter.api.Assertions.assertEquals("0 0 3 * * *", agendamento.cron());
        org.junit.jupiter.api.Assertions.assertEquals("UTC", agendamento.zone());
    }

    @Test
    void deveExcluirTokensExpiradosUsandoInstanteAtualComoLimite() {
        Instant antesDaExecucao = Instant.now();

        limpezaService.removerTokensExpirados();

        Instant depoisDaExecucao = Instant.now();
        ArgumentCaptor<Instant> limiteCaptor = ArgumentCaptor.forClass(Instant.class);
        verify(tokenUsuarioRepository).deleteByExpiraEmBefore(limiteCaptor.capture());

        Instant limiteUtilizado = limiteCaptor.getValue();
        assertFalse(limiteUtilizado.isBefore(antesDaExecucao));
        assertFalse(limiteUtilizado.isAfter(depoisDaExecucao));
    }
}
