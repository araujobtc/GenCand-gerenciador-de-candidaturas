package com.gencand.gencand_api.service;
import com.gencand.gencand_api.dto.response.DashboardResponse;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
@Service @RequiredArgsConstructor
public class DashboardService {
 private final CandidaturaRepository repository;
 @Transactional(readOnly=true)
 public DashboardResponse resumo(UUID usuarioId,LocalDate inicio,LocalDate fim) {
  if(inicio==null) inicio=LocalDate.of(1900,1,1);
  if(fim==null) fim=LocalDate.of(9999,12,31);
  if(inicio.isAfter(fim)) throw new IllegalArgumentException("A data inicial deve ser anterior à data final.");
  Map<String,Long> mapa=new LinkedHashMap<>();
  for(Object[] linha:repository.resumirPorStatus(usuarioId,inicio,fim)) mapa.put((String)linha[0],(Long)linha[1]);
  long total=mapa.values().stream().mapToLong(Long::longValue).sum();
  return new DashboardResponse(total,mapa,inicio,fim);
 }
}
