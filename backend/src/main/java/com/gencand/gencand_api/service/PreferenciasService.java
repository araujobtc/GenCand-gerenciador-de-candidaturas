package com.gencand.gencand_api.service;
import com.gencand.gencand_api.dto.request.PreferenciasRequest;
import com.gencand.gencand_api.dto.response.PreferenciasResponse;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service @RequiredArgsConstructor
public class PreferenciasService {
 private final UsuarioService usuarios;
 private final UsuarioRepository repository;
 @Transactional(readOnly=true) public PreferenciasResponse obter(UUID id){return response(usuarios.buscarPorId(id));}
 @Transactional public PreferenciasResponse atualizar(PreferenciasRequest r,UUID id){
  Usuario u=usuarios.buscarPorId(id);
  if(r.periodoPadrao()!=null)u.setPeriodoPadrao(r.periodoPadrao());
  if(r.diasParaParada()!=null)u.setDiasParaParada(r.diasParaParada());
  if(r.freqEmail()!=null)u.setFreqEmail(r.freqEmail());
  if(r.freqCelular()!=null)u.setFreqCelular(r.freqCelular());
  if(r.diaSemanaResumo()!=null)u.setDiaSemanaResumo(r.diaSemanaResumo());
  return response(repository.save(u));
 }
 private PreferenciasResponse response(Usuario u){return new PreferenciasResponse(u.getPeriodoPadrao(),u.getDiasParaParada(),u.getFreqEmail(),u.getFreqCelular(),u.getDiaSemanaResumo());}
}
