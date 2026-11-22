package com.gencand.gencand_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BrevoEmailService {

    private final RestClient.Builder restClientBuilder;

    @Value("${app.brevo.url}")
    private String url;

    @Value("${app.brevo.api-key:}")
    private String apiKey;

    @Value("${app.brevo.remetente-email:}")
    private String remetenteEmail;

    @Value("${app.brevo.remetente-nome:GenCand}")
    private String remetenteNome;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void enviarConfirmacaoEmail(String destinatario, String token) {
        if (apiKey.isBlank() || remetenteEmail.isBlank()) {
            throw new IllegalStateException(
                    "Configure BREVO_API_KEY e BREVO_REMETENTE_EMAIL para enviar a confirmação de e-mail");
        }

        String link = frontendUrl.replaceAll("/+$", "")
                + "/confirmar-email?token=" + token;

        Map<String, Object> corpo = Map.of(
                "sender", Map.of("name", remetenteNome, "email", remetenteEmail),
                "to", List.of(Map.of("email", destinatario)),
                "subject", "Confirme seu e-mail no GenCand",
                "htmlContent", """
                        <p>Olá!</p>
                        <p>Para confirmar seu endereço de e-mail no GenCand, acesse o link abaixo:</p>
                        <p><a href="%s">Confirmar meu e-mail</a></p>
                        <p>Este link expira em 24 horas. Se você não criou uma conta, ignore esta mensagem.</p>
                        """.formatted(link)
        );

        restClientBuilder.build()
                .post()
                .uri(url)
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(corpo)
                .retrieve()
                .toBodilessEntity();
    }
}
