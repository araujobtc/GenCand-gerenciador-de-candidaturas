package com.gencand.gencand_api.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;
@Getter @Setter @NoArgsConstructor
@Entity @Table(name="candidatura_contato")
public class CandidaturaContato {
 @Id @UuidGenerator(style=UuidGenerator.Style.VERSION_7)
 @Column(name="id",nullable=false,updatable=false) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="candidatura_id",nullable=false) private Candidatura candidatura;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="contato_id",nullable=false) private Contato contato;
 @Column(name="observacao") private String observacao;
}
