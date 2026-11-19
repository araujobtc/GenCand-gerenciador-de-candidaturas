package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Candidatura;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CandidaturaRepository extends JpaRepository<Candidatura, UUID> {

    // Lista paginada so da usuaria logada. Use oculta = false para a lista normal.
    Page<Candidatura> findByUsuarioIdAndOculta(UUID usuarioId, boolean oculta, Pageable pageable);

    // Toda busca por id leva o dono junto: e isso que impede ver dados de outra pessoa.
    Optional<Candidatura> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    boolean existsByIdAndUsuarioId(UUID id, UUID usuarioId);

    // Quantas candidaturas estao ligadas a uma plataforma (tela de Plataformas).
    long countByPlataformaId(UUID plataformaId);
}
