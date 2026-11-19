package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Curriculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CurriculoRepository extends JpaRepository<Curriculo, UUID> {

    // Atencao: estas consultas carregam o arquivo (bytea) de cada curriculo.
    // Com o limite de dois por usuaria isso e aceitavel; se crescer, use uma projecao sem o arquivo.
    List<Curriculo> findByUsuarioIdOrderByNomeAsc(UUID usuarioId);

    Optional<Curriculo> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    Optional<Curriculo> findByUsuarioIdAndPrincipalTrue(UUID usuarioId);

    // Para aplicar o limite de dois curriculos por usuaria.
    long countByUsuarioId(UUID usuarioId);
}
