package com.gencand.gencand_api.service;
import com.gencand.gencand_api.dto.request.ContatoVinculoRequest;
import com.gencand.gencand_api.dto.response.ContatoVinculoResponse;
import com.gencand.gencand_api.entity.*;
import com.gencand.gencand_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class ContatoService {
 private final CandidaturaRepository candidaturas;
 private final ContatoRepository contatos;
 private final CandidaturaContatoRepository vinculos;

 @Transactional(readOnly=true)
 public List<ContatoVinculoResponse> listar(UUID candidaturaId, UUID usuarioId) {
  validarCandidatura(candidaturaId,usuarioId);
  return vinculos.findByCandidaturaIdOrderByContatoNomeAsc(candidaturaId).stream().map(this::response).toList();
 }
 @Transactional
 public ContatoVinculoResponse vincular(UUID candidaturaId, ContatoVinculoRequest r, UUID usuarioId) {
  validarCandidatura(candidaturaId,usuarioId);
  Contato contato;
  if(r.contatoId()!=null) {
   contato=contatos.findByIdAndUsuarioId(r.contatoId(),usuarioId)
    .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contato não encontrado."));
  } else {
   if(r.nome()==null || r.nome().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe o nome ou selecione um contato existente.");
   contato=new Contato(); contato.setUsuario(candidaturas.findByIdAndUsuarioId(candidaturaId,usuarioId).orElseThrow().getUsuario());
   contato.setNome(r.nome().trim()); contato.setCargo(limpar(r.cargo())); contato.setEmail(limpar(r.email()));
   contato.setTelefone(limpar(r.telefone())); contato.setLinkedin(limpar(r.linkedin())); contato=contatos.save(contato);
  }
  if(vinculos.findByCandidaturaIdAndContatoId(candidaturaId,contato.getId()).isPresent())
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Este contato já está vinculado à candidatura.");
  CandidaturaContato v=new CandidaturaContato(); v.setCandidatura(candidaturas.findByIdAndUsuarioId(candidaturaId,usuarioId).orElseThrow());
  v.setContato(contato); v.setObservacao(limpar(r.observacao()));
  return response(vinculos.save(v));
 }
 @Transactional
 public ContatoVinculoResponse atualizarObservacao(UUID candidaturaId,UUID contatoId,String observacao,UUID usuarioId) {
  validarCandidatura(candidaturaId,usuarioId);
  CandidaturaContato v=vinculos.findByCandidaturaIdAndContatoId(candidaturaId,contatoId)
   .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Vínculo não encontrado."));
  v.setObservacao(limpar(observacao)); return response(vinculos.save(v));
 }
 @Transactional
 public void desvincular(UUID candidaturaId,UUID contatoId,UUID usuarioId) {
  validarCandidatura(candidaturaId,usuarioId);
  CandidaturaContato v=vinculos.findByCandidaturaIdAndContatoId(candidaturaId,contatoId)
   .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Vínculo não encontrado."));
  vinculos.delete(v);
 }
 private void validarCandidatura(UUID id,UUID user) {
  if(!candidaturas.existsByIdAndUsuarioId(id,user)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Candidatura não encontrada.");
 }
 private String limpar(String s){return s==null||s.isBlank()?null:s.trim();}
 private ContatoVinculoResponse response(CandidaturaContato v) {
  Contato c=v.getContato(); return new ContatoVinculoResponse(c.getId(),c.getNome(),c.getCargo(),c.getEmail(),c.getTelefone(),c.getLinkedin(),v.getObservacao());
 }
}
