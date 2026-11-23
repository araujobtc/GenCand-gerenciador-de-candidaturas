package com.gencand.gencand_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "candidatura")
public class Candidatura {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @Column(name = "id", nullable = false, updatable = false)
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

    @Column(name = "link", length = 255)
    private String link;

    @Column(name = "data_candidatura", nullable = false)
    private LocalDate dataCandidatura = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

    @Column(name = "data_atualizacao", nullable = false)
    private Instant dataAtualizacao = Instant.now();

    @Column(name = "status")
    private String status;

    @Column(name = "etapa_reprovacao")
    private String etapaReprovacao;

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "oculta", nullable = false)
    private Boolean oculta = false;
}