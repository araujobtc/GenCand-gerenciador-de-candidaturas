package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.nio.charset.StandardCharsets;

public record RegistroRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 50) String senha
) {
    @AssertTrue(message = "A senha não pode ultrapassar 72 bytes em UTF-8")
    public boolean isSenhaDentroDoLimiteBCrypt() {
        return senha == null || senha.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
