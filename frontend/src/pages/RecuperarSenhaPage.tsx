import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '../api/services/authService'
import AuthLayout from '../components/layout/AuthLayout'
import styles from '../components/layout/AuthLayout.module.css'

function RecuperarSenhaPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [concluido, setConcluido] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function solicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      setMensagem((await authService.solicitarRecuperacaoSenha(email)).mensagem)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível solicitar a recuperação.')
    } finally {
      setCarregando(false)
    }
  }

  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    setCarregando(true)
    try {
      setMensagem((await authService.redefinirSenha(token, senha)).mensagem)
      setConcluido(true)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível redefinir a senha.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout variant="login">
      {token ? (
        <>
          <h1>Redefinir senha</h1>
          <p className={styles.subtitle}>Crie uma nova senha para acessar sua conta.</p>
          {concluido ? (
            <>
              <p className={styles.message} role="status">{mensagem}</p>
              <Link className={styles.primary} to="/login">Ir para o login</Link>
            </>
          ) : (
            <form onSubmit={redefinir}>
              <label className={styles.field}>
                <span>Nova senha</span>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" />
              </label>
              <label className={styles.field}>
                <span>Confirmar nova senha</span>
                <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" />
              </label>
              {erro && <p className={styles.error} role="alert">{erro}</p>}
              <button className={styles.primary} type="submit" disabled={carregando}>{carregando ? 'Salvando...' : 'Redefinir senha'}</button>
            </form>
          )}
        </>
      ) : (
        <>
          <h1>Esqueci minha senha</h1>
          <p className={styles.subtitle}>Informe o e-mail associado à sua conta. Se houver um cadastro, enviaremos as instruções.</p>
          <form onSubmit={solicitar}>
            <label className={styles.field}>
              <span>E-mail</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="email" />
            </label>
            {mensagem && <p className={styles.message} role="status">{mensagem}</p>}
            {erro && <p className={styles.error} role="alert">{erro}</p>}
            <button className={styles.primary} type="submit" disabled={carregando}>{carregando ? 'Enviando...' : 'Enviar instruções'}</button>
          </form>
        </>
      )}
      <p className={styles.linkLine}><Link to="/login">Voltar para o login</Link></p>
    </AuthLayout>
  )
}

export default RecuperarSenhaPage
