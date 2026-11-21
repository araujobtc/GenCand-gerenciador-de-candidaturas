package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.request.PlataformaRequest;
import com.gencand.gencand_api.dto.response.PlataformaResponse;
import com.gencand.gencand_api.entity.Plataforma;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.PlataformaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlataformaService {

    private final PlataformaRepository plataformaRepository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public List<PlataformaResponse> listar(UUID usuarioId) {
        return plataformaRepository.findByUsuarioIdAndOcultaFalseOrderByNomeAsc(usuarioId)
                .stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlataformaResponse buscarPorId(UUID plataformaId, UUID usuarioId) {
        return paraResponse(buscarEntidade(plataformaId, usuarioId));
    }

    @Transactional
    public PlataformaResponse criar(PlataformaRequest request, UUID usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        if (plataformaRepository.existsByUsuarioIdAndNomeIgnoreCase(usuarioId, request.nome().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma plataforma com esse nome");
        }

        Plataforma plataforma = new Plataforma();
        plataforma.setUsuario(usuario);
        aplicarDados(plataforma, request);
        return paraResponse(plataformaRepository.save(plataforma));
    }

    @Transactional
    public PlataformaResponse atualizar(UUID plataformaId, PlataformaRequest request, UUID usuarioId) {
        Plataforma plataforma = buscarEntidade(plataformaId, usuarioId);

        boolean nomeEmUso = plataformaRepository.existsByUsuarioIdAndNomeIgnoreCase(usuarioId, request.nome().trim())
                && !plataforma.getNome().equalsIgnoreCase(request.nome().trim());
        if (nomeEmUso) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma plataforma com esse nome");
        }

        aplicarDados(plataforma, request);
        return paraResponse(plataformaRepository.save(plataforma));
    }

    @Transactional
    public void ocultar(UUID plataformaId, UUID usuarioId) {
        Plataforma plataforma = buscarEntidade(plataformaId, usuarioId);
        plataforma.setOculta(true);
        plataformaRepository.save(plataforma);
    }

    @Transactional
    public void excluir(UUID plataformaId, UUID usuarioId) {
        Plataforma plataforma = buscarEntidade(plataformaId, usuarioId);
        // A FK do banco usa ON DELETE SET NULL; candidaturas permanecem cadastradas.
        plataformaRepository.delete(plataforma);
    }

    private Plataforma buscarEntidade(UUID plataformaId, UUID usuarioId) {
        return plataformaRepository.findByIdAndUsuarioId(plataformaId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Plataforma não encontrada"));
    }

    private void aplicarDados(Plataforma plataforma, PlataformaRequest request) {
        plataforma.setNome(request.nome().trim());
        plataforma.setDominio(limpar(request.dominio()));
        plataforma.setObservacao(limpar(request.observacao()));
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private PlataformaResponse paraResponse(Plataforma plataforma) {
        return new PlataformaResponse(
                plataforma.getId(),
                plataforma.getNome(),
                plataforma.getDominio(),
                plataforma.getObservacao(),
                Boolean.TRUE.equals(plataforma.getOculta()));
    }
}
