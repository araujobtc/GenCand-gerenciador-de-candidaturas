package com.gencand.gencand_api.controller;
import com.gencand.gencand_api.dto.request.ContatoVinculoRequest;
import com.gencand.gencand_api.dto.response.ContatoVinculoResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.ContatoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/candidaturas/{candidaturaId}/contatos")
@RequiredArgsConstructor @Validated
public class ContatoController {
 private final ContatoService service;
 @GetMapping public List<ContatoVinculoResponse> listar(@PathVariable UUID candidaturaId,@UsuarioAtual UUID usuarioId){return service.listar(candidaturaId,usuarioId);}
 @PostMapping public ResponseEntity<ContatoVinculoResponse> vincular(@PathVariable UUID candidaturaId,
  @Valid @RequestBody ContatoVinculoRequest request,@UsuarioAtual UUID usuarioId){return ResponseEntity.status(201).body(service.vincular(candidaturaId,request,usuarioId));}
 @PatchMapping("/{contatoId}/observacao") public ContatoVinculoResponse observacao(@PathVariable UUID candidaturaId,
  @PathVariable UUID contatoId,@RequestBody(required=false) String observacao,@UsuarioAtual UUID usuarioId){
  return service.atualizarObservacao(candidaturaId,contatoId,observacao,usuarioId);
 }
 @DeleteMapping("/{contatoId}") public ResponseEntity<Void> desvincular(@PathVariable UUID candidaturaId,
  @PathVariable UUID contatoId,@UsuarioAtual UUID usuarioId){service.desvincular(candidaturaId,contatoId,usuarioId);return ResponseEntity.noContent().build();}
}
