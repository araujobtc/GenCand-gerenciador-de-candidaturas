package com.gencand.gencand_api.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CandidaturaResponse(
        UUID id,
        String titulo,
        String empresa,
        String link,
        UUID plataformaId,
        String plataformaNome,
        LocalDate dataCandidatura,
        Instant dataAtualizacao,
        String status,
        String observacao
) {
}
