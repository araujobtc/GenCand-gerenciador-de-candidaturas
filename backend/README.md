# GenCand — Backend

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
| `FRONTEND_URL` | Origem/base URL do frontend usada nos links de confirmação e recuperação de senha |

No Render, cadastre essas variáveis em **Environment** no serviço da API. Não coloque chaves ou senhas no repositório. Se as variáveis do Brevo estiverem vazias, o cadastro ainda será persistido, mas o e-mail não será enviado; o erro será registrado sem expor destinatário ou token.

### Banco de dados e migrações

- **PostgreSQL 18 ou superior é obrigatório.** A migração inicial `V1__criar_tabelas.sql` utiliza a função nativa `uuidv7()`, disponível a partir do PostgreSQL 18.
- O Flyway está configurado com `baseline-on-migrate: true` e `baseline-version: "1"`.
- Em um banco **não vazio e sem histórico do Flyway** (sem a tabela `flyway_schema_history`), o Flyway cria um baseline na versão 1. Nesse cenário, a migração V1 é considerada já aplicada e **não é executada**; as migrações posteriores (V2, V3 etc.) podem ser executadas normalmente.
- Essa configuração foi adotada para compatibilizar a aplicação com o banco existente no Neon, cujo esquema já foi criado a partir do modelo da V1. O baseline **não verifica nem corrige** se as tabelas e colunas existentes correspondem à V1. Antes de conectar outro banco não vazio, confirme manualmente que seu esquema é compatível.
- Em um banco vazio, sem tabelas de aplicação, a V1 é executada normalmente. Não crie manualmente um baseline para um banco vazio.

### Cadastro, confirmação e recuperação de senha

- O cadastro cria a conta como não confirmada e agenda o envio do link após o commit da transação.
- O login só é permitido depois da confirmação do endereço de e-mail.
- Respostas de cadastro e reenvio são genéricas para não revelar se um endereço já possui conta.
- Os tokens de confirmação são armazenados somente como hash, expiram em 24 horas e podem ser solicitados novamente.
- São permitidos até três reenvios por usuário em uma janela de uma hora, além do envio inicial.
- A recuperação de senha usa os endpoints `POST /api/auth/forgot-password` e `POST /api/auth/reset-password`. A solicitação tem resposta genérica, o token expira em uma hora e é de uso único.
- O link de recuperação enviado ao endereço de e-mail também confirma a posse do endereço. Isso permite que o titular recupere uma conta criada por outra pessoa com seu e-mail, sem que o cadastro inicial revele a existência da conta.
- Os e-mails são enviados de forma assíncrona após o commit. Falhas no Brevo não desfazem a gravação da conta ou do token.
- Os logs de envio não registram destinatário, token ou conteúdo da resposta do provedor.

### Links e domínios

- Links de candidaturas são armazenados como `TEXT` no PostgreSQL e aceitam até 2048 caracteres na API.
- Domínios de plataformas permanecem sem limite físico na coluna; a API valida até 255 caracteres.
- A migração V3 mantém as colunas como `TEXT`, sem reduzir nem truncar dados existentes. **Antes de publicar, confira `flyway_schema_history`: se a V3 original já tiver sido aplicada em algum ambiente, não implante esta alteração histórica sem planejar a reconciliação do checksum do Flyway.**

### Testes

Execute na pasta `backend`:

```bash
./mvnw test
```

Os testes de integração utilizam Testcontainers e PostgreSQL 18. É necessário ter Docker disponível. O GitHub Actions executa os testes em push e pull request.
