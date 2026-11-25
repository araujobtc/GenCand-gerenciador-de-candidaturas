package com.gencand.gencand_api.controller;
import com.gencand.gencand_api.dto.request.EntrevistaRequest;
import com.gencand.gencand_api.dto.response.EntrevistaResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.EntrevistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidaturas/{candidaturaId}/entrevistas")
@RequiredArgsConstructor
public class EntrevistaController {
 private final EntrevistaService service;
 @GetMapping public List<EntrevistaResponse> listar(@PathVariable UUID candidaturaId, @UsuarioAtual UUID usuarioId) {
  return service.listar(candidaturaId, usuarioId);
 }
 @PostMapping public ResponseEntity<EntrevistaResponse> criar(@PathVariable UUID candidaturaId,
  @Valid @RequestBody EntrevistaRequest request, @UsuarioAtual UUID usuarioId) {
  return ResponseEntity.status(201).body(service.criar(candidaturaId, request, usuarioId));
 }
 @PutMapping("/{id}") public EntrevistaResponse atualizar(@PathVariable UUID candidaturaId, @PathVariable UUID id,
  @Valid @RequestBody EntrevistaRequest request, @UsuarioAtual UUID usuarioId) {
  return service.atualizar(candidaturaId, id, request, usuarioId);
 }
 @DeleteMapping("/{id}") public ResponseEntity<Void> excluir(@PathVariable UUID candidaturaId, @PathVariable UUID id,
  @UsuarioAtual UUID usuarioId) {
  service.excluir(candidaturaId, id, usuarioId); return ResponseEntity.noContent().build();
 }
 @PostMapping("/{id}/lembretes") public EntrevistaResponse adicionarLembrete(@PathVariable UUID candidaturaId,
  @PathVariable UUID id, @RequestParam int minutosAntes, @UsuarioAtual UUID usuarioId) {
  return service.adicionarLembrete(candidaturaId, id, minutosAntes, usuarioId);
 }
 @DeleteMapping("/{id}/lembretes") public ResponseEntity<Void> removerLembrete(@PathVariable UUID candidaturaId,
  @PathVariable UUID id, @RequestParam int minutosAntes, @UsuarioAtual UUID usuarioId) {
  service.removerLembrete(candidaturaId, id, minutosAntes, usuarioId); return ResponseEntity.noContent().build();
 }
}
