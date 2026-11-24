package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Contato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContatoRepository extends JpaRepository<Contato, UUID> {

    List<Contato> findByUsuarioIdOrderByNomeAsc(UUID usuarioId);

    Optional<Contato> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    // Sugestao de contatos ja cadastrados ao digitar o nome.
    List<Contato> findByUsuarioIdAndNomeContainingIgnoreCase(UUID usuarioId, String nome);
}
