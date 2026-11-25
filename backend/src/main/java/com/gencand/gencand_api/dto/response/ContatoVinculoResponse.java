package com.gencand.gencand_api.dto.response;
import java.util.UUID;
public record ContatoVinculoResponse(UUID id, String nome, String cargo, String email, String telefone,
 String linkedin, String observacao) {}
