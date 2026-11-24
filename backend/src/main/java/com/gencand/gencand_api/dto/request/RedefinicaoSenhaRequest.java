package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinicaoSenhaRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 72) String novaSenha
) {
    @jakarta.validation.constraints.AssertTrue(message = "A senha não pode ultrapassar 72 bytes em UTF-8")
    public boolean isSenhaDentroDoLimiteBCrypt() {
        return novaSenha == null
                || novaSenha.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72;
    }
}
