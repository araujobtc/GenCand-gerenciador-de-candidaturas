package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.response.CurriculoResponse;
import com.gencand.gencand_api.entity.Curriculo;
import com.gencand.gencand_api.security.UsuarioAtual;
import com.gencand.gencand_api.service.CurriculoService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/curriculos")
@RequiredArgsConstructor
@Validated
public class CurriculoController {
    private final CurriculoService service;

    @GetMapping
    public List<CurriculoResponse> listar(@UsuarioAtual UUID usuarioId) {
        return service.listar(usuarioId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CurriculoResponse> criar(
            @RequestParam @NotBlank @Size(max=120) String nome,
            @RequestParam MultipartFile arquivo,
            @RequestParam(defaultValue="false") boolean principal,
            @UsuarioAtual UUID usuarioId) {
        return ResponseEntity.status(201).body(service.criar(nome, principal, arquivo, usuarioId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> baixar(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        Curriculo c = service.baixar(id, usuarioId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + c.getNome().replaceAll("[^A-Za-z0-9._-]", "_") + ".pdf\"")
                .body(c.getArquivo());
    }

    @PatchMapping("/{id}/principal")
    public ResponseEntity<Void> principal(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        service.definirPrincipal(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id, @UsuarioAtual UUID usuarioId) {
        service.excluir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
