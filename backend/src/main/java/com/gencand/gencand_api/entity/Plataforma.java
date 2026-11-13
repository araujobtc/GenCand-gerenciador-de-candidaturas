package com.gencand.gencand_api.plataforma.entity;

import com.gencand.gencand_api.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "plataforma")
public class Plataforma {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "dominio")
    private String dominio;

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "oculta", nullable = false)
    private Boolean oculta = false;
    
}