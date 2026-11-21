package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Plataforma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlataformaRepository extends JpaRepository<Plataforma, UUID> {

    List<Plataforma> findByUsuarioIdOrderByNomeAsc(UUID usuarioId);

    List<Plataforma> findByUsuarioIdAndOcultaFalseOrderByNomeAsc(UUID usuarioId);

    // Busca sempre junto do dono: um id de outra usuaria nao retorna nada.
    Optional<Plataforma> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    // Reconhecimento da plataforma pelo dominio do link da vaga.
    Optional<Plataforma> findByUsuarioIdAndDominioIgnoreCase(UUID usuarioId, String dominio);

    boolean existsByUsuarioIdAndNomeIgnoreCase(UUID usuarioId, String nome);
}
