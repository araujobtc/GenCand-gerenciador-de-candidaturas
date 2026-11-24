package com.gencand.gencand_api.service;

/** Evento interno; o token existe apenas em memória e nunca é persistido em texto. */
public record EmailRecuperacaoSenhaSolicitadoEvent(String destinatario, String token) {
}
