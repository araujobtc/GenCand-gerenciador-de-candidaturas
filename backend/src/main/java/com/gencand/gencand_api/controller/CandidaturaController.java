package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.CandidaturaAtualizacaoRequest;
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
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidaturas")
@RequiredArgsConstructor
public class CandidaturaController {

    private static final int TAMANHO_MAXIMO_PAGINA = 100;
    private static final Set<String> CAMPOS_ORDENACAO_PERMITIDOS = Set.of(
            "dataCandidatura",
            "dataAtualizacao",
            "status",
            "empresa"
    );

    private final CandidaturaService candidaturaService;

    @GetMapping
    public ResponseEntity<PagedModel<CandidaturaResponse>> listar(
            @UsuarioAtual UUID usuarioId,
            @PageableDefault(
                    size = 20,
                    sort = "dataCandidatura",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        validarOrdenacao(pageable);

        Pageable paginacaoSegura = PageRequest.of(
                pageable.getPageNumber(),
                Math.min(pageable.getPageSize(), TAMANHO_MAXIMO_PAGINA),
                pageable.getSort());

        return ResponseEntity.ok(new PagedModel<>(
                candidaturaService.listar(usuarioId, paginacaoSegura)));
    }

    private void validarOrdenacao(Pageable pageable) {
        boolean ordenacaoInvalida = pageable.getSort().stream()
                .anyMatch(order -> !CAMPOS_ORDENACAO_PERMITIDOS.contains(order.getProperty()));

        if (ordenacaoInvalida) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Campo de ordenação inválido. Campos permitidos: dataCandidatura, dataAtualizacao, status e empresa.");
        }
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

    // O PUT atualiza somente os dados editáveis e preserva o status existente.
    // Para alterar o status, use exclusivamente PATCH /{id}/status.
    @PutMapping("/{id}")
    public ResponseEntity<CandidaturaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CandidaturaAtualizacaoRequest request,
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
