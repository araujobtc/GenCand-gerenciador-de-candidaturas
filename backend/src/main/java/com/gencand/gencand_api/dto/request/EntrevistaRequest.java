package com.gencand.gencand_api.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
public record EntrevistaRequest(
 @NotBlank @Size(max=40) String tipo,
 @NotNull Instant dataHora,
 @Size(max=40) String plataformaChamada,
 @Size(max=2048) String linkChamada
) {}
