package com.gencand.gencand_api.dto.response;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record EntrevistaResponse(UUID id, String tipo, Instant dataHora, String plataformaChamada,
 String linkChamada, List<Integer> lembretesMinutosAntes) {}
