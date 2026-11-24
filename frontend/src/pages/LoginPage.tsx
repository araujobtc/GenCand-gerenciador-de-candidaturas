import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/layout/AuthLayout'
import styles from '../components/layout/AuthLayout.module.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(email, senha)
      navigate('/candidaturas')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout variant="login">
      <h1>Entrar</h1>
      <p className={styles.subtitle}>Acesse sua conta para acompanhar suas candidaturas.</p>
      <form onSubmit={enviar}>
        <label className={styles.field}>
          <span>E-mail</span>
          <input type="email" placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className={styles.field}>
          <span>Senha</span>
          <input type="password" placeholder="••••••••••" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" />
        </label>
        <div className={styles.authLinks}>
          <Link className={styles.textLink} to="/recuperar-senha">Esqueci minha senha</Link>
          <Link className={styles.textLink} to={`/confirmar-email?email=${encodeURIComponent(email)}`}>Não recebeu o link de confirmação?</Link>
        </div>
        {erro && <p className={styles.error} role="alert">{erro}</p>}
        <button className={styles.primary} type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className={styles.linkLine}>Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>
    </AuthLayout>
  )
}

export default LoginPage
