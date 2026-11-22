package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ConfirmacaoEmailRequest(
        @NotBlank String token
) {
}
