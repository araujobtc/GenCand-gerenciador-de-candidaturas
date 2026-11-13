
package com.gencand.gencand_api.candidatura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "lembrete_entrevista",
    uniqueConstraints = @UniqueConstraint(
        name = "ux_lembrete_entrevista_minutos",
        columnNames = {"entrevista_id", "minutos_antes"}
    )
)
public class LembreteEntrevista {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entrevista_id", nullable = false)
    private Entrevista entrevista;

    @Column(name = "minutos_antes", nullable = false)
    private Integer minutosAntes;

    @Column(name = "enviado", nullable = false, insertable = false)
    private Boolean enviado;
}
