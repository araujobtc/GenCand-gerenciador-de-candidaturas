package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Curriculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CurriculoRepository extends JpaRepository<Curriculo, UUID> {
    List<Curriculo> findByUsuarioIdOrderByNomeAsc(UUID usuarioId);
    Optional<Curriculo> findByIdAndUsuarioId(UUID id, UUID usuarioId);
    Optional<Curriculo> findByUsuarioIdAndPrincipalTrue(UUID usuarioId);
    long countByUsuarioId(UUID usuarioId);
}
