package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.CandidaturaRequest;
import com.gencand.gencand_api.dto.response.CandidaturaResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.CandidaturaService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidaturas")
@RequiredArgsConstructor
public class CandidaturaController {

    private final CandidaturaService candidaturaService;

    @GetMapping
    public ResponseEntity<Page<CandidaturaResponse>> listar(
            @UsuarioAtual UUID usuarioId,
            @PageableDefault(
                    size = 20,
                    sort = "dataCandidatura",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        return ResponseEntity.ok(candidaturaService.listar(usuarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidaturaResponse> buscarPorId(
            @PathVariable UUID id,
            @UsuarioAtual UUID usuarioId) {

        return ResponseEntity.ok(candidaturaService.buscarPorId(id, usuarioId));
    }

    @PostMapping
    public ResponseEntity<CandidaturaResponse> criar(
            @Valid @RequestBody CandidaturaRequest request,
            @UsuarioAtual UUID usuarioId) {

        CandidaturaResponse response = candidaturaService.criar(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidaturaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CandidaturaRequest request,
            @UsuarioAtual UUID usuarioId) {

        return ResponseEntity.ok(candidaturaService.atualizar(id, request, usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable UUID id,
            @UsuarioAtual UUID usuarioId) {

        candidaturaService.excluir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
