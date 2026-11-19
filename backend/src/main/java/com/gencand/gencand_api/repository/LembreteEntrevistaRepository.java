package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.LembreteEntrevista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LembreteEntrevistaRepository extends JpaRepository<LembreteEntrevista, UUID> {

    List<LembreteEntrevista> findByEntrevistaId(UUID entrevistaId);
}
