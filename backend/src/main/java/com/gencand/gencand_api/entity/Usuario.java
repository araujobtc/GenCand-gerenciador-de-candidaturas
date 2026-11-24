package com.gencand.gencand_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "email_confirmado", nullable = false)
    private Boolean emailConfirmado = false;

    @Column(name = "periodo_padrao", nullable = false)
    private String periodoPadrao = "SEMESTRE";

    @Column(name = "dias_para_parada", nullable = false)
    private Integer diasParaParada = 7;

    @Column(name = "freq_email", nullable = false)
    private String freqEmail = "SEMANAL";

    @Column(name = "freq_celular", nullable = false)
    private String freqCelular = "DIARIA";

    @Column(name = "dia_semana_resumo", nullable = false)
    private String diaSemanaResumo = "SEGUNDA";
}
