package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.CandidaturaRequest;
import com.gencand.gencand_api.dto.request.CandidaturaStatusRequest;
import com.gencand.gencand_api.dto.response.CandidaturaResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.CandidaturaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidaturas")
@RequiredArgsConstructor
public class CandidaturaController {

    private static final int TAMANHO_MAXIMO_PAGINA = 100;

    private final CandidaturaService candidaturaService;

    @GetMapping
    public ResponseEntity<PagedModel<CandidaturaResponse>> listar(
            @UsuarioAtual UUID usuarioId,
            @PageableDefault(
                    size = 20,
                    sort = "dataCandidatura",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Pageable paginacaoSegura = PageRequest.of(
                pageable.getPageNumber(),
                Math.min(pageable.getPageSize(), TAMANHO_MAXIMO_PAGINA),
                pageable.getSort());

        return ResponseEntity.ok(new PagedModel<>(
                candidaturaService.listar(usuarioId, paginacaoSegura)));
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

    // PUT substitui os campos editáveis; envie todos, inclusive status (null para sem status).
    // Para alterar somente o status, use PATCH /{id}/status.
    @PutMapping("/{id}")
    public ResponseEntity<CandidaturaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CandidaturaRequest request,
            @UsuarioAtual UUID usuarioId) {
        return ResponseEntity.ok(candidaturaService.atualizar(id, request, usuarioId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CandidaturaResponse> atualizarStatus(
            @PathVariable UUID id,
            @Valid @RequestBody CandidaturaStatusRequest request,
            @UsuarioAtual UUID usuarioId) {
        return ResponseEntity.ok(candidaturaService.atualizarStatus(
                id, request.status(), usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable UUID id,
            @UsuarioAtual UUID usuarioId) {
        candidaturaService.excluir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
