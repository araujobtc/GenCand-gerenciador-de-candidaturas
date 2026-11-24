import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../api/services/authService'
import { ApiError } from '../api/apiClient'
import styles from './ConfirmarEmailPage.module.css'

type Estado = 'carregando' | 'sucesso' | 'expirado' | 'sem-token' | 'falha'

const confirmacoesEmAndamento = new Map<string, Promise<void>>()

function confirmarUmaVez(token: string): Promise<void> {
  let requisicao = confirmacoesEmAndamento.get(token)
  if (!requisicao) {
    requisicao = authService.confirmarEmail({ token }).then(() => undefined)
    confirmacoesEmAndamento.set(token, requisicao)
  }
  return requisicao
}

function ConfirmarEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [estado, setEstado] = useState<Estado>(token ? 'carregando' : 'sem-token')
  const [reenviando, setReenviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!token) return
    let ativo = true

    confirmarUmaVez(token)
      .then(() => {
        if (ativo) setEstado('sucesso')
      })
      .catch((error: unknown) => {
        if (!ativo) return
        if (error instanceof ApiError && error.status === 400) {
          setEstado('expirado')
        } else {
          setEstado('falha')
        }
      })

    return () => { ativo = false }
  }, [token])

  async function solicitarNovoLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setErro('')
    setReenviando(true)
    try {
      setMensagem((await authService.reenviarConfirmacao({ email })).mensagem)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível solicitar um novo link.')
    } finally {
      setReenviando(false)
    }
  }

  if (estado === 'carregando') {
    return <main className={styles.page}><p className={styles.loading}>Validando seu e-mail...</p></main>
  }

  if (estado === 'sucesso') {
    return (
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="status-title">
          <div className={styles.iconWrap}><div className={styles.successIcon} aria-hidden="true"><span /></div></div>
          <h1 id="status-title">E-mail confirmado!</h1>
          <p className={styles.description}>Seu endereço de e-mail foi validado com sucesso.<br />Agora você já pode acessar sua conta.</p>
          <Link className={styles.primary} to="/login">Ir para o login <span aria-hidden="true">→</span></Link>
          <p className={styles.helper}>Sua conta está pronta para uso.</p>
        </section>
        <footer>© 2026 GenCand · Organizador de candidaturas</footer>
      </main>
    )
  }

  if (estado === 'expirado' || estado === 'sem-token') {
    return (
      <main className={styles.page}>
        <section className={styles.cardExpired} aria-labelledby="status-title">
          <div className={styles.iconWrap}><div className={styles.expiredIcon} aria-hidden="true"><span /></div></div>
          <h1 id="status-title">{estado === 'sem-token' ? 'Link de confirmação não informado' : 'Link de confirmação inválido ou expirado'}</h1>
          <p className={styles.description}>{estado === 'sem-token' ? 'O endereço acessado não contém um link de confirmação.' : 'Este link não é mais válido. Informe seu e-mail para receber uma nova mensagem de confirmação.'}</p>
          <form className={styles.resendForm} onSubmit={solicitarNovoLink}>
            <label htmlFor="email">E-mail cadastrado</label>
            <input id="email" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" maxLength={254} />
            <button className={styles.primary} type="submit" disabled={reenviando}>{reenviando ? 'Enviando...' : 'Enviar novo link de confirmação'}</button>
          </form>
          {mensagem && <p className={styles.feedback} role="status">{mensagem}</p>}
          {erro && <p className={styles.error} role="alert">{erro}</p>}
          <p className={styles.loginPrompt}>Já confirmou seu e-mail?</p>
          <Link className={styles.loginLink} to="/login">Voltar para o login</Link>
        </section>
        <footer>© 2026 GenCand · Organizador de candidaturas</footer>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="status-title">
        <div className={styles.iconWrap}><div className={styles.failureIcon} aria-hidden="true"><span>!</span></div></div>
        <h1 id="status-title">Não foi possível confirmar</h1>
        <p className={styles.description}>Não conseguimos validar seu e-mail neste momento.<br />Por favor, tente novamente mais tarde.</p>
        <Link className={styles.primary} to="/login">Voltar para o login <span aria-hidden="true">→</span></Link>
        <p className={styles.helper}>Se o problema persistir, tente novamente em alguns minutos.</p>
      </section>
      <footer>© 2026 GenCand · Organizador de candidaturas</footer>
    </main>
  )
}

export default ConfirmarEmailPage
