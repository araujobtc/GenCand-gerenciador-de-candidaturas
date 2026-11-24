-- Mantém URLs como TEXT para preservar links longos de vagas e parâmetros de rastreamento.
-- O tamanho é validado na API; não há conversão destrutiva de dados existentes.
ALTER TABLE candidatura
    ALTER COLUMN link TYPE text;

ALTER TABLE plataforma
    ALTER COLUMN dominio TYPE text;
