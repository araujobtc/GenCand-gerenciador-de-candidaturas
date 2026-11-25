package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.request.EntrevistaRequest;
import com.gencand.gencand_api.dto.response.EntrevistaResponse;
import com.gencand.gencand_api.entity.*;
import com.gencand.gencand_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EntrevistaService {
 private final EntrevistaRepository entrevistas;
 private final LembreteEntrevistaRepository lembretes;
 private final CandidaturaService candidaturas;
 private final CandidaturaRepository candidaturaRepository;

 @Transactional(readOnly=true)
 public List<EntrevistaResponse> listar(UUID candidaturaId, UUID usuarioId) {
  validarCandidatura(candidaturaId, usuarioId);
  return entrevistas.findByCandidaturaIdOrderByDataHoraAsc(candidaturaId).stream().map(this::response).toList();
 }

 @Transactional
 public EntrevistaResponse criar(UUID candidaturaId, EntrevistaRequest request, UUID usuarioId) {
  Candidatura candidatura = validarCandidatura(candidaturaId, usuarioId);
  Entrevista e = new Entrevista();
  e.setCandidatura(candidatura); aplicar(e, request);
  e = entrevistas.save(e);
  criarLembretePadrao(e);
  candidaturas.atualizarStatus(candidaturaId, "ENTREVISTADA", usuarioId);
  return response(e);
 }

 @Transactional
 public EntrevistaResponse atualizar(UUID candidaturaId, UUID id, EntrevistaRequest request, UUID usuarioId) {
  validarCandidatura(candidaturaId, usuarioId);
  Entrevista e = entrevistas.findByIdAndCandidaturaId(id, candidaturaId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrevista não encontrada."));
  aplicar(e, request);
  return response(entrevistas.save(e));
 }

 @Transactional
 public void excluir(UUID candidaturaId, UUID id, UUID usuarioId) {
  validarCandidatura(candidaturaId, usuarioId);
  Entrevista e = entrevistas.findByIdAndCandidaturaId(id, candidaturaId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrevista não encontrada."));
  entrevistas.delete(e);
 }

 @Transactional
 public EntrevistaResponse adicionarLembrete(UUID candidaturaId, UUID id, int minutos, UUID usuarioId) {
  validarCandidatura(candidaturaId, usuarioId);
  if (minutos < 1 || minutos > 525600) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Antecedência inválida.");
  Entrevista e = entrevistas.findByIdAndCandidaturaId(id, candidaturaId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrevista não encontrada."));
  boolean existe = lembretes.findByEntrevistaId(id).stream().anyMatch(l -> l.getMinutosAntes() == minutos);
  if (!existe) { LembreteEntrevista l = new LembreteEntrevista(); l.setEntrevista(e); l.setMinutosAntes(minutos); l.setEnviado(false); lembretes.save(l); }
  return response(e);
 }

 @Transactional
 public void removerLembrete(UUID candidaturaId, UUID id, int minutos, UUID usuarioId) {
  validarCandidatura(candidaturaId, usuarioId);
  entrevistas.findByIdAndCandidaturaId(id, candidaturaId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrevista não encontrada."));
  lembretes.findByEntrevistaId(id).stream().filter(l -> l.getMinutosAntes() == minutos).findFirst().ifPresent(lembretes::delete);
 }

 private Candidatura validarCandidatura(UUID id, UUID usuarioId) {
  return candidaturaRepository.findByIdAndUsuarioId(id, usuarioId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidatura não encontrada."));
 }
 private void criarLembretePadrao(Entrevista e) {
  LembreteEntrevista l = new LembreteEntrevista(); l.setEntrevista(e); l.setMinutosAntes(1440); l.setEnviado(false); lembretes.save(l);
 }
 private void aplicar(Entrevista e, EntrevistaRequest r) {
  e.setTipo(r.tipo().trim()); e.setDataHora(r.dataHora());
  e.setPlataformaChamada(r.plataformaChamada()); e.setLinkChamada(r.linkChamada());
 }
 private EntrevistaResponse response(Entrevista e) {
  return new EntrevistaResponse(e.getId(), e.getTipo(), e.getDataHora(), e.getPlataformaChamada(),
    e.getLinkChamada(), lembretes.findByEntrevistaId(e.getId()).stream().map(LembreteEntrevista::getMinutosAntes).sorted().toList());
 }
}
