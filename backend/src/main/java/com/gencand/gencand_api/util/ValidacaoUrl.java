package com.gencand.gencand_api.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

public final class ValidacaoUrl {

    private ValidacaoUrl() {
    }

    public static String validarLink(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return validarEndereco(valor.trim(), false);
    }

    public static String validarDominio(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return validarEndereco(valor.trim(), true);
    }

    private static String validarEndereco(String valor, boolean aceitarDominioSemEsquema) {
        try {
            URI uri = new URI(valor);
            if (uri.getScheme() == null && aceitarDominioSemEsquema) {
                uri = new URI("https://" + valor);
            }

            String esquema = uri.getScheme();
            boolean esquemaPermitido = esquema != null
                    && (esquema.toLowerCase(Locale.ROOT).equals("http")
                    || esquema.toLowerCase(Locale.ROOT).equals("https"));

            if (!esquemaPermitido || uri.getHost() == null || uri.getUserInfo() != null) {
                throw new URISyntaxException(valor, "URL deve usar http ou https e possuir um host válido");
            }

            return valor;
        } catch (URISyntaxException | IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    aceitarDominioSemEsquema
                            ? "Informe um domínio válido, sem esquema ou usando http:// ou https://"
                            : "O link deve ser uma URL válida iniciada por http:// ou https://");
        }
    }
}
