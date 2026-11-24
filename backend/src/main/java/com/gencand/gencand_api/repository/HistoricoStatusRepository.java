package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.HistoricoStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HistoricoStatusRepository extends JpaRepository<HistoricoStatus, UUID> {

    // Do mais recente para o mais antigo. Antes de chamar, confirme que a candidatura e da usuaria.
    List<HistoricoStatus> findByCandidaturaIdOrderByAlteradoEmDesc(UUID candidaturaId);
}
