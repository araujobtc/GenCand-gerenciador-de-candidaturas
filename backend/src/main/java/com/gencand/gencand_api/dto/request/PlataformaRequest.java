package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlataformaRequest(
        @NotBlank @Size(max = 255) String nome,
        @Size(max = 500) String dominio,
        @Size(max = 5000) String observacao
) {
}
