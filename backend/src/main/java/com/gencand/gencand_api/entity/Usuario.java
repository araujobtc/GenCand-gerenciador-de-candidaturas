package com.gencand.gencand_api.usuario.entity;

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
@Table(name = "usuario")
public class Usuario {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "id", updatable = false, nullable = false)
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