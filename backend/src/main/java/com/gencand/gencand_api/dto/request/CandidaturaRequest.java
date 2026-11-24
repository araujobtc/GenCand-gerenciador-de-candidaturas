package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CandidaturaRequest(
        @NotBlank @Size(max = 255) String titulo,
        @NotBlank @Size(max = 255) String empresa,
        @Size(max = 2048) String link,
        UUID plataformaId,
        LocalDate dataCandidatura,
        @Pattern(regexp = "BANCO_DE_TALENTOS|CANDIDATADA|ATIVIDADE_PENDENTE|ATIVIDADE_REALIZADA|ENTREVISTADA|AGUARDANDO_RESULTADO|PASSEI|NAO_PASSEI|VAGA_ENCERRADA|SUMIU|DESISTI")
        String status,
        @Size(max = 5000) String observacao
) {
}