-- Limita os endereços armazenados, mantendo a validação também na API.
alter table candidatura
    alter column link type varchar(255);

alter table plataforma
    alter column dominio type varchar(255);
