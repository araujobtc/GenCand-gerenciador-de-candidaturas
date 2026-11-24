package com.gencand.gencand_api.service;

import com.gencand.gencand_api.dto.request.CandidaturaAtualizacaoRequest;
import com.gencand.gencand_api.dto.request.CandidaturaRequest;
import com.gencand.gencand_api.dto.response.CandidaturaResponse;
import com.gencand.gencand_api.entity.Candidatura;
import com.gencand.gencand_api.entity.HistoricoStatus;
import com.gencand.gencand_api.entity.Plataforma;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import com.gencand.gencand_api.repository.HistoricoStatusRepository;
import com.gencand.gencand_api.repository.PlataformaRepository;
import com.gencand.gencand_api.util.ValidacaoUrl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidaturaService {

    private static final ZoneId FUSO_BRASILIA = ZoneId.of("America/Sao_Paulo");

    private final CandidaturaRepository candidaturaRepository;
    private final PlataformaRepository plataformaRepository;
    private final HistoricoStatusRepository historicoStatusRepository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public Page<CandidaturaResponse> listar(UUID usuarioId, Pageable pageable) {
        return candidaturaRepository.findByUsuarioIdAndOculta(usuarioId, false, pageable)
                .map(this::paraResponse);
    }

    @Transactional(readOnly = true)
    public CandidaturaResponse buscarPorId(UUID candidaturaId, UUID usuarioId) {
        return paraResponse(buscarEntidade(candidaturaId, usuarioId));
    }

    @Transactional
    public CandidaturaResponse criar(CandidaturaRequest request, UUID usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        Candidatura candidatura = new Candidatura();
        candidatura.setUsuario(usuario);
        candidatura.setDataCandidatura(request.dataCandidatura() != null
                ? request.dataCandidatura() : LocalDate.now(FUSO_BRASILIA));
        candidatura.setDataAtualizacao(Instant.now());
        aplicarDadosComuns(candidatura, request.titulo(), request.empresa(),
                request.link(), request.plataformaId(), request.dataCandidatura(),
                request.observacao(), usuarioId);
        candidatura.setStatus(request.status());

        Candidatura salva = candidaturaRepository.save(candidatura);
        registrarHistoricoSeNecessario(salva, null, salva.getStatus());
        return paraResponse(salva);
    }

    @Transactional
    public CandidaturaResponse atualizar(
            UUID candidaturaId, CandidaturaAtualizacaoRequest request, UUID usuarioId) {
        Candidatura candidatura = buscarEntidade(candidaturaId, usuarioId);

        // O status não faz parte do DTO de PUT e, portanto, permanece inalterado.
        aplicarDadosComuns(candidatura, request.titulo(), request.empresa(),
                request.link(), request.plataformaId(), request.dataCandidatura(),
                request.observacao(), usuarioId);
        candidatura.setDataAtualizacao(Instant.now());

        return paraResponse(candidaturaRepository.save(candidatura));
    }

    @Transactional
    public CandidaturaResponse atualizarStatus(
            UUID candidaturaId, String statusNovo, UUID usuarioId) {
        Candidatura candidatura = buscarEntidade(candidaturaId, usuarioId);
        String statusAnterior = candidatura.getStatus();

        if (!Objects.equals(statusAnterior, statusNovo)) {
            candidatura.setStatus(statusNovo);
            candidatura.setDataAtualizacao(Instant.now());
            Candidatura salva = candidaturaRepository.save(candidatura);
            registrarHistoricoSeNecessario(salva, statusAnterior, statusNovo);
            return paraResponse(salva);
        }

        return paraResponse(candidatura);
    }

    @Transactional
    public CandidaturaResponse verificarHoje(UUID candidaturaId, UUID usuarioId) {
        Candidatura candidatura = buscarEntidade(candidaturaId, usuarioId);
        candidatura.setDataAtualizacao(Instant.now());
        return paraResponse(candidaturaRepository.save(candidatura));
    }

    @Transactional
    public void ocultar(UUID candidaturaId, UUID usuarioId) {
        Candidatura candidatura = buscarEntidade(candidaturaId, usuarioId);
        candidatura.setOculta(true);
        candidaturaRepository.save(candidatura);
    }

    @Transactional
    public void excluir(UUID candidaturaId, UUID usuarioId) {
        Candidatura candidatura = buscarEntidade(candidaturaId, usuarioId);
        candidaturaRepository.delete(candidatura);
    }

    private void registrarHistoricoSeNecessario(
            Candidatura candidatura, String statusAnterior, String statusNovo) {
        if (statusNovo == null) {
            return;
        }

        HistoricoStatus historico = new HistoricoStatus();
        historico.setCandidatura(candidatura);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(statusNovo);
        historicoStatusRepository.save(historico);
    }

    private Candidatura buscarEntidade(UUID candidaturaId, UUID usuarioId) {
        return candidaturaRepository.findByIdAndUsuarioId(candidaturaId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Candidatura não encontrada"));
    }

    private void aplicarDadosComuns(
            Candidatura candidatura,
            String titulo,
            String empresa,
            String link,
            UUID plataformaId,
            LocalDate dataCandidatura,
            String observacao,
            UUID usuarioId) {

        candidatura.setTitulo(titulo.trim());
        candidatura.setEmpresa(empresa.trim());
        candidatura.setLink(ValidacaoUrl.validarLink(link));
        candidatura.setObservacao(limpar(observacao));

        if (dataCandidatura != null) {
            candidatura.setDataCandidatura(dataCandidatura);
        }

        if (plataformaId == null) {
            candidatura.setPlataforma(null);
        } else {
            Plataforma plataforma = plataformaRepository
                    .findByIdAndUsuarioId(plataformaId, usuarioId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Plataforma não encontrada"));
            candidatura.setPlataforma(plataforma);
        }
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private CandidaturaResponse paraResponse(Candidatura candidatura) {
        Plataforma plataforma = candidatura.getPlataforma();
        return new CandidaturaResponse(
                candidatura.getId(),
                candidatura.getTitulo(),
                candidatura.getEmpresa(),
                candidatura.getLink(),
                plataforma != null ? plataforma.getId() : null,
                plataforma != null ? plataforma.getNome() : null,
                candidatura.getDataCandidatura(),
                candidatura.getDataAtualizacao(),
                candidatura.getStatus(),
                candidatura.getObservacao());
    }
}