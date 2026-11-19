package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.TokenUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TokenUsuarioRepository extends JpaRepository<TokenUsuario, UUID> {

    // O banco guarda so o hash do token; a busca e feita pelo hash.
    Optional<TokenUsuario> findByTokenHash(String tokenHash);

    // Tokens ainda validos de um tipo, para invalidar os anteriores ao gerar um novo.
    List<TokenUsuario> findByUsuarioIdAndTipoAndUsadoFalse(UUID usuarioId, String tipo);

    // Limpeza periodica. Chame de um metodo com @Transactional.
    long deleteByExpiraEmBefore(Instant limite);
}
