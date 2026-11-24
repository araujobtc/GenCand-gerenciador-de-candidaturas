package com.gencand.gencand_api.dto.response;

import java.util.UUID;

public record PlataformaResponse(
        UUID id,
        String nome,
        String dominio,
        String observacao,
        boolean oculta
) {
}
