package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.response.CurriculoResponse;
import com.gencand.gencand_api.entity.Curriculo;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.CurriculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurriculoService {
    private final CurriculoRepository repository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public List<CurriculoResponse> listar(UUID usuarioId) {
        return repository.findByUsuarioIdOrderByNomeAsc(usuarioId).stream().map(this::response).toList();
    }

    @Transactional
    public CurriculoResponse criar(String nome, boolean principal, MultipartFile arquivo, UUID usuarioId) {
        if (arquivo == null || arquivo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um arquivo PDF.");
        try {
            byte[] bytes = arquivo.getBytes();
            if (bytes.length < 5 || bytes[0] != '%' || bytes[1] != 'P' || bytes[2] != 'D' || bytes[3] != 'F' || bytes[4] != '-') {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo enviado não é um PDF válido.");
            }
            Usuario usuario = usuarioService.buscarPorId(usuarioId);
            Curriculo c = new Curriculo();
            c.setUsuario(usuario);
            c.setNome(nome == null || nome.isBlank() ? "Currículo" : nome.trim());
            c.setArquivo(bytes);
            c.setPrincipal(principal || repository.countByUsuarioId(usuarioId) == 0);
            if (c.getPrincipal()) repository.findByUsuarioIdAndPrincipalTrue(usuarioId).ifPresent(atual -> {
                atual.setPrincipal(false); repository.saveAndFlush(atual);
            });
            return response(repository.save(c));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler o arquivo.");
        }
    }

    @Transactional(readOnly = true)
    public Curriculo baixar(UUID id, UUID usuarioId) {
        return repository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Currículo não encontrado."));
    }

    @Transactional
    public void definirPrincipal(UUID id, UUID usuarioId) {
        Curriculo alvo = baixar(id, usuarioId);
        repository.findByUsuarioIdAndPrincipalTrue(usuarioId).ifPresent(atual -> {
            atual.setPrincipal(false); repository.saveAndFlush(atual);
        });
        alvo.setPrincipal(true);
        repository.save(alvo);
    }

    @Transactional
    public void excluir(UUID id, UUID usuarioId) {
        Curriculo alvo = baixar(id, usuarioId);
        boolean eraPrincipal = Boolean.TRUE.equals(alvo.getPrincipal());
        repository.delete(alvo);
        repository.flush();
        if (eraPrincipal) repository.findByUsuarioIdOrderByNomeAsc(usuarioId).stream().findFirst().ifPresent(outro -> {
            outro.setPrincipal(true); repository.save(outro);
        });
    }

    private CurriculoResponse response(Curriculo c) {
        return new CurriculoResponse(c.getId(), c.getNome(), Boolean.TRUE.equals(c.getPrincipal()),
                c.getArquivo() == null ? 0 : c.getArquivo().length);
    }
}
