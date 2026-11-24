package com.gencand.gencand_api.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class EmailConfirmacaoListener {

    private static final Logger log = LoggerFactory.getLogger(EmailConfirmacaoListener.class);
    private final BrevoEmailService brevoEmailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviar(EmailConfirmacaoSolicitadoEvent evento) {
        try {
            brevoEmailService.enviarConfirmacaoEmail(evento.destinatario(), evento.token());
        } catch (RuntimeException exception) {
            log.error("Falha ao enviar e-mail de confirmação. Verifique a configuração do Brevo e os logs do provedor.");
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarRecuperacao(EmailRecuperacaoSenhaSolicitadoEvent evento) {
        try {
            brevoEmailService.enviarRecuperacaoSenha(evento.destinatario(), evento.token());
        } catch (RuntimeException exception) {
            log.error("Falha ao enviar e-mail de recuperação de senha. Verifique a configuração do Brevo e os logs do provedor.");
        }
    }
}
