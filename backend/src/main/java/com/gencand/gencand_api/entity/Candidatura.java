package com.gencand.gencand_api.candidatura.entity;

import com.gencand.gencand_api.plataforma.entity.Plataforma;
import com.gencand.gencand_api.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "candidatura")
public class Candidatura {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plataforma_id")
    private Plataforma plataforma;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "empresa", nullable = false)
    private String empresa;

    @Column(name = "link")
    private String link;

    @Column(name = "data_candidatura", nullable = false)
    private LocalDate dataCandidatura;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDate dataAtualizacao;

    @Column(name = "status")
    private String status;

    @Column(name = "etapa_reprovacao")
    private String etapaReprovacao;

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "oculta", nullable = false)
    private Boolean oculta = false;
    
}