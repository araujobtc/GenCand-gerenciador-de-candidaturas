# GenCand — Organizador de Candidaturas

Aplicação web para registrar e acompanhar candidaturas a vagas de emprego.

## Estrutura do repositório

- `frontend/`: aplicação web React, TypeScript e Vite.
- `backend/`: API Java com Spring Boot e PostgreSQL.

## Requisitos

- Node.js 22 ou versão compatível com o Vite utilizado no projeto.
- npm.
- Java 25.
- Docker, para executar os testes de integração do backend com Testcontainers.
- PostgreSQL 18 ou superior para executar o backend com o banco real. A migração inicial utiliza a função `uuidv7()`.

## Executar o frontend

Na pasta `frontend`, configure `.env.local` com a URL base da API (sem o sufixo `/api`):

```env
GENCAND_API_URL=http://localhost:8080
```

Instale as dependências e inicie a aplicação:

```bash
cd frontend
npm install
npm run dev
```

Verificações disponíveis:

```bash
npm run lint
npm run build
```

O build também executa a verificação de tipos TypeScript.

## Executar o backend

Configure as variáveis de ambiente necessárias:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | URL JDBC do PostgreSQL |
| `DATABASE_USER` | Usuário do banco |
| `DATABASE_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo JWT com pelo menos 32 caracteres |
| `BREVO_API_KEY` | Chave de API do Brevo para e-mails transacionais |
| `BREVO_REMETENTE_EMAIL` | Endereço de remetente verificado no Brevo |
| `BREVO_REMETENTE_NOME` | Nome exibido como remetente (opcional) |
| `FRONTEND_URL` | URL/origem do frontend usada nos links de autenticação |

Na pasta `backend`, execute:

```bash
./mvnw spring-boot:run
```

Para executar os testes:

```bash
./mvnw --batch-mode --no-transfer-progress test
```

Os testes de integração utilizam Testcontainers e precisam de Docker disponível.

## Funcionalidades contempladas

- Cadastro, confirmação de e-mail, login e recuperação de senha.
- Gerenciamento de candidaturas.
- Associação de candidaturas a plataformas.
- Isolamento dos dados por usuário.

A recuperação de senha utiliza `POST /api/auth/forgot-password` e `POST /api/auth/reset-password`. O token é de uso único e expira em uma hora.

## Banco de dados e migrações

O Flyway está habilitado e utiliza `baseline-on-migrate: true`, com versão de baseline 1. Em bancos não vazios sem histórico do Flyway, a V1 é considerada aplicada e não é executada; o baseline não valida nem corrige o esquema existente.

**Antes de publicar alterações de migração, confira a tabela `flyway_schema_history` do ambiente.** A V3 foi modificada durante o desenvolvimento; se uma versão anterior dela já tiver sido aplicada, será necessário planejar a reconciliação do checksum antes do deploy. Não altere o histórico manualmente sem avaliar o estado real do banco.

## Documentação específica

- [Documentação do frontend](frontend/README.md)
- [Documentação do backend](backend/README.md)
