
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
@Table(name = "historico_status")
public class HistoricoStatus {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidatura_id", nullable = false)
    private Candidatura candidatura;

    @Column(name = "status_anterior")
    private String statusAnterior;

    @Column(name = "status_novo", nullable = false)
    private String statusNovo;

    @Column(name = "alterado_em", nullable = false,
            insertable = false, updatable = false)
    private Instant alteradoEm;
}
