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
    void deveRejeitarEsquemaJavascriptEmLink() {
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarLink("javascript:alert(1)"));
    }

    @Test
    void deveRejeitarLinkSemHostValido() {
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarLink("https:///caminho"));
    }

    @Test
    void deveRejeitarCredenciaisEmUrl() {
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarLink("https://usuario:senha@empresa.com/vaga"));
    }

    @Test
    void deveRetornarNullParaLinkOpcionalVazio() {
        assertEquals(null, ValidacaoUrl.validarLink("  "));
        assertEquals(null, ValidacaoUrl.validarDominio(null));
    }

    @Test
    void deveAceitarDominioSemEsquema() {
        assertEquals("linkedin.com", ValidacaoUrl.validarDominio("linkedin.com"));
    }

    @Test
    void deveAceitarDominioComHttpOuHttps() {
        assertEquals("https://gupy.io", ValidacaoUrl.validarDominio("https://gupy.io"));
        assertEquals("http://gupy.io", ValidacaoUrl.validarDominio("http://gupy.io"));
    }

    @Test
    void deveRejeitarEsquemaJavascriptEmDominio() {
        assertThrows(ResponseStatusException.class,
                () -> ValidacaoUrl.validarDominio("javascript:alert(1)"));
    }
}
