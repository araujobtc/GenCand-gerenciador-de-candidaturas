package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.nio.charset.StandardCharsets;

public record LoginRequest(

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Informe um e-mail válido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(max = 50, message = "A senha deve ter no máximo 50 caracteres")
        String senha

) {
    @AssertTrue(message = "A senha não pode ultrapassar 72 bytes em UTF-8")
    public boolean isSenhaDentroDoLimiteBCrypt() {
        return senha == null || senha.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
