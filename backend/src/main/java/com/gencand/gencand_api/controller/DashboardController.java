package com.gencand.gencand_api.controller;
import com.gencand.gencand_api.dto.response.DashboardResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
public class DashboardController {
 private final DashboardService service;
 @GetMapping public DashboardResponse resumo(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate inicio,
  @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate fim,@UsuarioAtual UUID usuarioId) {
  return service.resumo(usuarioId,inicio,fim);
 }
}
