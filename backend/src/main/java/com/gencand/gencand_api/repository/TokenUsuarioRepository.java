package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.TokenUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TokenUsuarioRepository extends JpaRepository<TokenUsuario, UUID> {

    Optional<TokenUsuario> findByTokenHash(String tokenHash);

    List<TokenUsuario> findByUsuarioIdAndTipoAndUsadoFalse(UUID usuarioId, String tipo);

    long countByUsuarioIdAndTipoAndCriadoEmAfter(
            UUID usuarioId, String tipo, Instant criadoEm);

    long deleteByExpiraEmBefore(Instant limite);
}
