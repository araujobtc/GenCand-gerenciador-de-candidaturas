package com.gencand.gencand_api.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
