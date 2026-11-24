package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Atualização dos dados editáveis da candidatura.
 * O status é alterado exclusivamente pelo endpoint PATCH /{id}/status.
 */
public record CandidaturaAtualizacaoRequest(
        @NotBlank @Size(max = 255) String titulo,
        @NotBlank @Size(max = 255) String empresa,
        @Size(max = 2048) String link,
        UUID plataformaId,
        LocalDate dataCandidatura,
        @Size(max = 5000) String observacao
) {
}