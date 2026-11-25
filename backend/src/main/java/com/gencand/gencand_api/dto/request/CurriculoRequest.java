package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CurriculoRequest(@NotBlank @Size(max = 120) String nome, boolean principal) {}
