package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.PlataformaRequest;
import com.gencand.gencand_api.dto.response.PlataformaResponse;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.PlataformaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plataformas")
@RequiredArgsConstructor
public class PlataformaController {
    private final PlataformaService service;

    @GetMapping
    public List<PlataformaResponse> listar(@UsuarioAtual UUID usuarioId) {
        return service.listar(usuarioId);
    }

    @GetMapping("/{id}")
    public PlataformaResponse buscar(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        return service.buscarPorId(id, usuarioId);
    }

    @PostMapping
    public ResponseEntity<PlataformaResponse> criar(@Valid @RequestBody PlataformaRequest request,
                                                    @UsuarioAtual UUID usuarioId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, usuarioId));
    }

    @PutMapping("/{id}")
    public PlataformaResponse atualizar(@PathVariable UUID id, @Valid @RequestBody PlataformaRequest request,
                                         @UsuarioAtual UUID usuarioId) {
        return service.atualizar(id, request, usuarioId);
    }

    @PatchMapping("/{id}/ocultar")
    public ResponseEntity<Void> ocultar(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        service.ocultar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        service.excluir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
