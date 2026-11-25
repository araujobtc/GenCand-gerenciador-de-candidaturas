package com.gencand.gencand_api.dto.request;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
public record PreferenciasRequest(
 @Pattern(regexp="MES|SEMESTRE|ANO") String periodoPadrao,
 @Min(1) @Max(365) Integer diasParaParada,
 @Pattern(regexp="DIARIA|SEMANAL|DESATIVADA") String freqEmail,
 @Pattern(regexp="DIARIA|SEMANAL|DESATIVADA") String freqCelular,
 @Pattern(regexp="SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO|DOMINGO") String diaSemanaResumo
) {}
