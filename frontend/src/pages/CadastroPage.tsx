import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/layout/AuthLayout'
import styles from '../components/layout/AuthLayout.module.css'
import confirmationStyles from './ConfirmarEmailPage.module.css'

function CadastroPage() {
  const { registrar } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setErro('')
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    setCarregando(true)
    try {
      setMensagem(await registrar(email, senha))
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível realizar o cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  if (mensagem) {
    return (
      <main className={confirmationStyles.page}>
        <section className={confirmationStyles.card} aria-labelledby="status-title">
          <div className={confirmationStyles.iconWrap}>
            <div className={confirmationStyles.successIcon} aria-hidden="true"><span /></div>
          </div>
          <h1 id="status-title">Verifique seu e-mail</h1>
          <p className={confirmationStyles.description}>{mensagem}</p>
          <Link className={confirmationStyles.primary} to="/login">
            Voltar para o login <span aria-hidden="true">→</span>
          </Link>
          <p className={confirmationStyles.helper}>Você precisará confirmar o endereço antes de entrar.</p>
        </section>
        <footer className={confirmationStyles.pageFooter}>© 2026 GenCand · Organizador de candidaturas</footer>
      </main>
    )
  }

  return (
    <AuthLayout variant="cadastro">
      <h1>Criar conta</h1>
      <p className={styles.subtitle}>Leva menos de um minuto.</p>
      <form onSubmit={enviar}>
        <label className={styles.field}>
          <span>E-mail</span>
          <input type="email" placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="email" />
        </label>
        <label className={styles.field}>
          <span>Senha</span>
          <input type="password" placeholder="••••••••••" value={senha} onChange={e => setSenha(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" />
        </label>
        <p style={{ fontSize: 12, color: '#647087', marginTop: -17, marginBottom: 20 }}>Mínimo de 8 caracteres.</p>
        <label className={styles.field}>
          <span>Confirmar senha</span>
          <input type="password" placeholder="••••••••••" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
        <p style={{ fontSize: 12, color: '#647087', margin: '-2px 0 24px' }}>Enviaremos um link de confirmação para o endereço informado.</p>
        {mensagem && <p className={styles.message} role="status">{mensagem}</p>}
        {erro && <p className={styles.error} role="alert">{erro}</p>}
        <button className={styles.primary} type="submit" disabled={carregando}>{carregando ? 'Enviando...' : 'Criar conta'}</button>
      </form>
      <p className={styles.linkLine}>Já tem conta? <Link to="/login">Entrar</Link></p>
    </AuthLayout>
  )
}

export default CadastroPage
