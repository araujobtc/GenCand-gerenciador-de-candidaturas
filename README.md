# GenCand — Organizador de Candidaturas

Projeto de organização e acompanhamento de candidaturas a vagas.

## Backend

A API utiliza Java 25, Spring Boot e PostgreSQL. Para executar localmente, configure as variáveis de ambiente abaixo antes de iniciar a aplicação.

### Variáveis necessárias

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | URL JDBC do PostgreSQL |
| `DATABASE_USER` | Usuário do banco |
| `DATABASE_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo JWT com pelo menos 32 caracteres |
| `BREVO_API_KEY` | Chave de API do Brevo com permissão de envio transacional |
| `BREVO_REMETENTE_EMAIL` | Endereço de remetente verificado no Brevo |
| `BREVO_REMETENTE_NOME` | Nome exibido como remetente (opcional) |
| `FRONTEND_URL` | Origem/base URL do frontend usada no link de confirmação |

No Render, cadastre essas variáveis em **Environment** no serviço da API. Não coloque chaves ou senhas no repositório. Se as variáveis do Brevo estiverem vazias, o cadastro ainda será persistido, mas o e-mail não será enviado; o erro será registrado sem expor destinatário ou token.

### Banco de dados e migrações

- **PostgreSQL 18 ou superior é obrigatório.** A migração inicial `V1__criar_tabelas.sql` utiliza a função nativa `uuidv7()`, disponível a partir do PostgreSQL 18.
- O Flyway está configurado com `baseline-on-migrate: true` e `baseline-version: "1"`.
- Em um banco **não vazio e sem histórico do Flyway** (sem a tabela `flyway_schema_history`), o Flyway cria um baseline na versão 1. Nesse cenário, a migração V1 é considerada já aplicada e **não é executada**; as migrações posteriores (V2, V3 etc.) podem ser executadas normalmente.
- Essa configuração foi adotada para compatibilizar a aplicação com o banco existente no Neon, cujo esquema já foi criado a partir do modelo da V1. O baseline **não verifica nem corrige** se as tabelas e colunas existentes correspondem à V1. Antes de conectar outro banco não vazio, confirme manualmente que seu esquema é compatível.
- Em um banco vazio, sem tabelas de aplicação, a V1 é executada normalmente. Não crie manualmente um baseline para um banco vazio.

### E-mail de confirmação

- O registro cria o usuário e o token dentro da transação.
- O envio é agendado após o commit e executado de forma assíncrona, para que uma falha no Brevo não desfaça o cadastro.
- O token é armazenado somente como hash e expira em 24 horas.
- O endpoint `POST /api/auth/resend-confirmation` permite solicitar novo link para cadastro ainda não confirmado.
- São permitidos até três reenvios por usuário em uma janela de uma hora, além do envio inicial.
- Os logs de envio bem-sucedido contêm somente assunto e remetente.

### Testes

Execute na pasta `backend`:

```bash
./mvnw test
```

Os testes de integração utilizam Testcontainers e PostgreSQL 18. É necessário ter Docker disponível. O GitHub Actions executa os testes em push e pull request.
