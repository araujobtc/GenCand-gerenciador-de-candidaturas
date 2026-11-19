package com.gencand.gencand_api.repository;

import com.gencand.gencand_api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    // O IgnoreCase gera lower(email) = lower(?), que usa o indice unico ux_usuario_email do banco.
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
