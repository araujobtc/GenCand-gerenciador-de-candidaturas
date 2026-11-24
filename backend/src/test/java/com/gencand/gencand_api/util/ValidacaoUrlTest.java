package com.gencand.gencand_api.util;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ValidacaoUrlTest {

    @Test
    void deveAceitarLinksHttpEHttps() {
        assertEquals("https://empresa.com/vaga", ValidacaoUrl.validarLink("https://empresa.com/vaga"));
        assertEquals("http://empresa.com/vaga", ValidacaoUrl.validarLink("http://empresa.com/vaga"));
    }

    @Test
    void deveRejeitarEsquemasPerigosos() {
        assertThrows(ResponseStatusException.class, () -> ValidacaoUrl.validarLink("javascript:alert(1)"));
        assertThrows(ResponseStatusException.class, () -> ValidacaoUrl.validarDominio("javascript:alert(1)"));
    }

    @Test
    void deveRejeitarLinkSemHostValidoOuComCredenciais() {
        assertThrows(ResponseStatusException.class, () -> ValidacaoUrl.validarLink("https:///caminho"));
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarLink("https://usuario:senha@empresa.com/vaga"));
    }

    @Test
    void deveRetornarNullParaEnderecoOpcionalVazio() {
        assertEquals(null, ValidacaoUrl.validarLink("  "));
        assertEquals(null, ValidacaoUrl.validarDominio(null));
    }

    @Test
    void deveAceitarDominioSemEsquemaEComPorta() {
        assertEquals("https://linkedin.com", ValidacaoUrl.validarDominio("linkedin.com"));
        assertEquals("https://localhost:8080", ValidacaoUrl.validarDominio("localhost:8080"));
        assertEquals("https://exemplo.com:8080", ValidacaoUrl.validarDominio("exemplo.com:8080"));
    }

    @Test
    void deveNormalizarEsquemaHostECaminho() {
        assertEquals("https://empresa.com/vaga", ValidacaoUrl.validarDominio("HTTPS://EMPRESA.COM/a/../vaga"));
    }

    @Test
    void deveRejeitarHostComCaracteresInvalidos() {
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarDominio("dominio_com_underscore.com"));
    }
}
