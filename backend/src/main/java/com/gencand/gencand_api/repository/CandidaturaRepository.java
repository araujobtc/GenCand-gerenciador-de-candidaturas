package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Candidatura;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidaturaRepository extends JpaRepository<Candidatura, UUID> {
    @EntityGraph(attributePaths = "plataforma")
    Page<Candidatura> findByUsuarioIdAndOculta(UUID usuarioId, boolean oculta, Pageable pageable);
    Optional<Candidatura> findByIdAndUsuarioId(UUID id, UUID usuarioId);
    boolean existsByIdAndUsuarioId(UUID id, UUID usuarioId);
    long countByPlataformaId(UUID plataformaId);

    @Query("select coalesce(c.status, 'SEM_STATUS'), count(c) from Candidatura c " +
           "where c.usuario.id = :usuarioId and c.oculta = false " +
           "and c.dataCandidatura between :inicio and :fim group by c.status")
    List<Object[]> resumirPorStatus(@Param("usuarioId") UUID usuarioId,
                                    @Param("inicio") LocalDate inicio,
                                    @Param("fim") LocalDate fim);
}
