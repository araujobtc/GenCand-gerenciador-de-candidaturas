
package com.gencand.gencand_api.curriculo.entity;

import com.gencand.gencand_api.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.generator.EventType;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "curriculo")
public class Curriculo {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "principal", nullable = false)
    private Boolean principal = false;

    @Column(name = "arquivo", nullable = false, columnDefinition = "bytea")
    private byte[] arquivo;
}
