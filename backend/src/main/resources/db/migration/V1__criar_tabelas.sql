-- V1: modelo de dados aprovado do Organizador de candidaturas.
-- Identico ao que foi criado no banco "gencand" da branch development do Neon.
-- Ids: UUID versao 7 (uuidv7(), disponivel no PostgreSQL 18).
-- Status da candidatura: texto com lista fixa; NULL significa "sem status".

create table usuario (
    id uuid primary key default uuidv7(),
    email text not null,
    senha_hash text not null,
    email_confirmado boolean not null default false,
    periodo_padrao text not null default 'SEMESTRE',
    dias_para_parada integer not null default 7,
    freq_email text not null default 'SEMANAL',
    freq_celular text not null default 'DIARIA',
    dia_semana_resumo text not null default 'SEGUNDA',
    constraint ck_usuario_periodo check (periodo_padrao in ('MES','SEMESTRE','ANO')),
    constraint ck_usuario_dias check (dias_para_parada >= 1),
    constraint ck_usuario_freq_email check (freq_email in ('DIARIA','SEMANAL','DESATIVADA')),
    constraint ck_usuario_freq_celular check (freq_celular in ('DIARIA','SEMANAL','DESATIVADA')),
    constraint ck_usuario_dia_semana check (dia_semana_resumo in ('SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO'))
);
create unique index ux_usuario_email on usuario (lower(email));

create table plataforma (
    id uuid primary key default uuidv7(),
    usuario_id uuid not null references usuario(id) on delete cascade,
    nome text not null,
    dominio text,
    observacao text,
    oculta boolean not null default false
);
create unique index ux_plataforma_usuario_nome on plataforma (usuario_id, lower(nome));
create index ix_plataforma_usuario_dominio on plataforma (usuario_id, lower(dominio));

create table candidatura (
    id uuid primary key default uuidv7(),
    usuario_id uuid not null references usuario(id) on delete cascade,
    plataforma_id uuid references plataforma(id) on delete set null,
    titulo text not null,
    empresa text not null,
    link text,
    data_candidatura date not null default current_date,
    data_atualizacao timestamptz not null default now(),
    status text,
    etapa_reprovacao text,
    observacao text,
    oculta boolean not null default false,
    constraint ck_candidatura_status check (status is null or status in (
        'BANCO_DE_TALENTOS','CANDIDATADA','ATIVIDADE_PENDENTE','ATIVIDADE_REALIZADA','ENTREVISTADA',
        'AGUARDANDO_RESULTADO','PASSEI','NAO_PASSEI','VAGA_ENCERRADA','SUMIU','DESISTI'))
);
create index ix_candidatura_usuario_data on candidatura (usuario_id, data_candidatura desc);
create index ix_candidatura_usuario_status on candidatura (usuario_id, status);
create index ix_candidatura_usuario_atualizacao on candidatura (usuario_id, data_atualizacao);
create index ix_candidatura_plataforma on candidatura (plataforma_id);

create table historico_status (
    id uuid primary key default uuidv7(),
    candidatura_id uuid not null references candidatura(id) on delete cascade,
    status_anterior text,
    status_novo text not null,
    alterado_em timestamptz not null default now(),
    constraint ck_hist_anterior check (status_anterior is null or status_anterior in (
        'BANCO_DE_TALENTOS','CANDIDATADA','ATIVIDADE_PENDENTE','ATIVIDADE_REALIZADA','ENTREVISTADA',
        'AGUARDANDO_RESULTADO','PASSEI','NAO_PASSEI','VAGA_ENCERRADA','SUMIU','DESISTI')),
    constraint ck_hist_novo check (status_novo in (
        'BANCO_DE_TALENTOS','CANDIDATADA','ATIVIDADE_PENDENTE','ATIVIDADE_REALIZADA','ENTREVISTADA',
        'AGUARDANDO_RESULTADO','PASSEI','NAO_PASSEI','VAGA_ENCERRADA','SUMIU','DESISTI'))
);
create index ix_historico_candidatura on historico_status (candidatura_id, alterado_em desc);

create table entrevista (
    id uuid primary key default uuidv7(),
    candidatura_id uuid not null references candidatura(id) on delete cascade,
    tipo text not null,
    data_hora timestamptz not null,
    plataforma_chamada text,
    link_chamada text
);
create index ix_entrevista_candidatura on entrevista (candidatura_id, data_hora);

create table lembrete_entrevista (
    id uuid primary key default uuidv7(),
    entrevista_id uuid not null references entrevista(id) on delete cascade,
    minutos_antes integer not null,
    enviado boolean not null default false,
    constraint ck_lembrete_minutos check (minutos_antes > 0),
    constraint ux_lembrete_entrevista_minutos unique (entrevista_id, minutos_antes)
);
create index ix_lembrete_pendentes on lembrete_entrevista (entrevista_id) where not enviado;

create table contato (
    id uuid primary key default uuidv7(),
    usuario_id uuid not null references usuario(id) on delete cascade,
    nome text not null,
    cargo text,
    email text,
    telefone text,
    linkedin text
);
create index ix_contato_usuario_nome on contato (usuario_id, lower(nome));

create table candidatura_contato (
    id uuid primary key default uuidv7(),
    candidatura_id uuid not null references candidatura(id) on delete cascade,
    contato_id uuid not null references contato(id) on delete cascade,
    observacao text,
    constraint ux_candidatura_contato unique (candidatura_id, contato_id)
);
create index ix_candidatura_contato_contato on candidatura_contato (contato_id);

create table curriculo (
    id uuid primary key default uuidv7(),
    usuario_id uuid not null references usuario(id) on delete cascade,
    nome text not null,
    principal boolean not null default false,
    arquivo bytea not null
);
create unique index ux_curriculo_principal on curriculo (usuario_id) where principal;

create table token_usuario (
    id uuid primary key default uuidv7(),
    usuario_id uuid not null references usuario(id) on delete cascade,
    tipo text not null,
    token_hash text not null,
    expira_em timestamptz not null,
    usado boolean not null default false,
    constraint ck_token_tipo check (tipo in ('RECUPERAR_SENHA','CONFIRMAR_EMAIL')),
    constraint ux_token_hash unique (token_hash)
);
create index ix_token_usuario on token_usuario (usuario_id, tipo);
