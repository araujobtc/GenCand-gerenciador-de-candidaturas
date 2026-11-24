# GenCand — Frontend

Aplicação web do **GenCand**, um organizador de candidaturas a vagas de emprego.

## Tecnologias

- React
- TypeScript
- Vite
- React Router
- CSS Modules

## Requisitos

- Node.js 22 ou versão compatível com Vite 8
- npm

## Configuração

Na pasta `frontend`, crie um arquivo `.env.local` com a URL base da API:

```env
GENCAND_API_URL=http://localhost:8080
```

A variável deve conter somente a origem da API, sem o sufixo `/api`.

## Executar em desenvolvimento

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run lint
npm run build
```

O comando de build executa a verificação de tipos do TypeScript e gera os arquivos de produção em `dist/`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local de desenvolvimento |
| `npm run lint` | Executa o ESLint |
| `npm run build` | Verifica os tipos e gera a versão de produção |
| `npm run preview` | Disponibiliza localmente a versão de produção |

## Estrutura principal

- `src/api`: cliente HTTP e serviços de comunicação com a API.
- `src/features/auth`: contexto e estado de autenticação.
- `src/components`: componentes reutilizáveis.
- `src/pages`: telas da aplicação.
- `src/routes`: definição das rotas públicas e privadas.
- `src/hooks`: hooks compartilhados.
- `src/types`: tipos TypeScript.
- `src/utils`: funções utilitárias.

## Autenticação

O token de acesso é mantido em `sessionStorage`. A API é responsável pela autenticação, confirmação de e-mail, recuperação de senha e isolamento dos dados de cada usuário.
