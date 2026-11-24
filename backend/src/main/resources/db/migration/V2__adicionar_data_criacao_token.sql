-- Registra quando cada token foi criado para aplicar limite de reenvio por usuário.
ALTER TABLE token_usuario
    ADD COLUMN criado_em timestamptz;

-- Tokens de confirmação existentes tinham validade de 24 horas.
UPDATE token_usuario
SET criado_em = expira_em - INTERVAL '24 hours'
WHERE tipo = 'CONFIRMAR_EMAIL';

UPDATE token_usuario
SET criado_em = now()
WHERE criado_em IS NULL;

ALTER TABLE token_usuario
    ALTER COLUMN criado_em SET DEFAULT now(),
    ALTER COLUMN criado_em SET NOT NULL;

CREATE INDEX ix_token_usuario_criado
    ON token_usuario (usuario_id, tipo, criado_em);
