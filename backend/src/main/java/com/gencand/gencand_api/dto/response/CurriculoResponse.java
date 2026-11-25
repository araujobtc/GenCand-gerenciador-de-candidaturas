package com.gencand.gencand_api.dto.response;

import java.util.UUID;

public record CurriculoResponse(UUID id, String nome, boolean principal, long tamanhoBytes) {}
