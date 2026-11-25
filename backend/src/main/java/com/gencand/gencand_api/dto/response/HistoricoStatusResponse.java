package com.gencand.gencand_api.dto.response;

import java.time.Instant;

public record HistoricoStatusResponse(String statusAnterior, String statusNovo, Instant alteradoEm) {
}
