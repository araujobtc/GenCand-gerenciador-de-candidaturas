package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Entrevista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntrevistaRepository extends JpaRepository<Entrevista, UUID> {

    List<Entrevista> findByCandidaturaIdOrderByDataHoraAsc(UUID candidaturaId);

    Optional<Entrevista> findByIdAndCandidaturaId(UUID id, UUID candidaturaId);
}
