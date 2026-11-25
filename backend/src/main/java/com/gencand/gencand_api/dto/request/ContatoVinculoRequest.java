package com.gencand.gencand_api.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.UUID;
public record ContatoVinculoRequest(UUID contatoId,
 @Size(max=160) String nome, @Size(max=120) String cargo, @Email @Size(max=254) String email,
 @Size(max=40) String telefone, @Size(max=2048) String linkedin, @Size(max=5000) String observacao) {}
