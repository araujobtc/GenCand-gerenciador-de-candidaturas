# GenCand — Controle de candidaturas

Aplicação para registrar e acompanhar candidaturas a vagas de emprego.

## Estrutura

- `frontend/`: aplicação web React, TypeScript e Vite.
- `backend/`: API Java com Spring Boot.

## Requisitos

- Node.js compatível com a versão do Vite utilizada no projeto.
- npm.
- API GenCand em execução para utilizar autenticação e persistência.

## Executar o frontend

No terminal, entre na pasta `frontend` e instale as dependências:

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local` a partir de `.env.example` e configure a URL base da API:

```env
GENCAND_API_URL=http://localhost:8080
```

A variável deve conter a URL base do backend, sem acrescentar `/api`.

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Verificações do frontend

Na pasta `frontend`:

```bash
npm run lint
npm run build
```

O comando de build executa a verificação TypeScript e gera os arquivos de produção em `frontend/dist`.

## Configuração de produção

Configure `GENCAND_API_URL` no ambiente de build do frontend para apontar para a URL pública da API. Não coloque senhas, tokens privados ou outras credenciais no frontend.

## Escopo atual

A versão inicial contempla cadastro, login, confirmação de e-mail e gerenciamento de candidaturas. Funcionalidades como gerenciamento de plataformas e recuperação de senha ainda não estão disponíveis nesta versão.
