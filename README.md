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

### E-mail de confirmação

- O registro cria o usuário e o token dentro da transação.
- O envio é agendado após o commit e executado de forma assíncrona, para que uma falha no Brevo não desfaça o cadastro.
- O token é armazenado somente como hash e expira em 24 horas.
- O endpoint `POST /api/auth/resend-confirmation` permite solicitar novo link para cadastro ainda não confirmado.
- O reenvio é limitado a 3 solicitações por usuário em uma janela de uma hora.
- Os logs de envio bem-sucedido contêm somente assunto e remetente.

### Testes

Execute na pasta `backend`:

```bash
./mvnw test
```

Os testes de integração utilizam Testcontainers e PostgreSQL 18. É necessário ter Docker disponível. O GitHub Actions executa os testes em push e pull request.
