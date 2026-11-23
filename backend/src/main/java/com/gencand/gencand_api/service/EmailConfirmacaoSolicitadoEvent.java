package com.gencand.gencand_api.service;

/**
 * Evento interno com os dados necessários para enviar o link após a transação.
 * O token em texto existe apenas na memória e nunca é persistido ou registrado em log.
 */
public record EmailConfirmacaoSolicitadoEvent(String destinatario, String token) {
}
