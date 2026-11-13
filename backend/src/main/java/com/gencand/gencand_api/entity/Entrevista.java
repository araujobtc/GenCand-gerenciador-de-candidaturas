
package com.gencand.gencand_api.candidatura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "entrevista")
public class Entrevista {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidatura_id", nullable = false)
    private Candidatura candidatura;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @Column(name = "data_hora", nullable = false)
    private Instant dataHora;

    @Column(name = "plataforma_chamada")
    private String plataformaChamada;

    @Column(name = "link_chamada")
    private String linkChamada;
}
