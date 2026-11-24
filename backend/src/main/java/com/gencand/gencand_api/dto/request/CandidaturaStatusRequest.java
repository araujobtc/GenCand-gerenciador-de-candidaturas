package com.gencand.gencand_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CandidaturaStatusRequest(
        @NotBlank
        @Pattern(regexp = "BANCO_DE_TALENTOS|CANDIDATADA|ATIVIDADE_PENDENTE|ATIVIDADE_REALIZADA|ENTREVISTADA|AGUARDANDO_RESULTADO|PASSEI|NAO_PASSEI|VAGA_ENCERRADA|SUMIU|DESISTI")
        String status
) {
}
