package com.gencand.gencand_api.controller;
import com.gencand.gencand_api.dto.request.PreferenciasRequest;
import com.gencand.gencand_api.dto.response.PreferenciasResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.PreferenciasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController @RequestMapping("/api/configuracoes") @RequiredArgsConstructor
public class PreferenciasController {
 private final PreferenciasService service;
 @GetMapping public PreferenciasResponse obter(@UsuarioAtual UUID usuarioId){return service.obter(usuarioId);}
 @PutMapping public PreferenciasResponse atualizar(@Valid @RequestBody PreferenciasRequest request,@UsuarioAtual UUID usuarioId){
  return service.atualizar(request,usuarioId);
 }
}
