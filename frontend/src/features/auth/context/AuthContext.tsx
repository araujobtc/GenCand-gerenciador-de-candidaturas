import { useEffect, useState, type ReactNode } from 'react'
import { authService } from '../../../api/services/authService'
import { CHAVE_TOKEN, lerToken, removerToken, salvarToken } from '../../../api/apiClient'
import { AuthContext } from './AuthContextValue'
import type { AuthContextValue } from '../../../types/authContext'

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => lerToken())

  useEffect(() => {
    function encerrarSessao() {
      removerToken()
      setToken(null)
    }

    function sincronizarSessao(event: StorageEvent) {
      if (event.key !== CHAVE_TOKEN && event.key !== null) return
      const novoToken = event.key === null ? null : event.newValue
      setToken(novoToken)
    }

    window.addEventListener('gencand:unauthorized', encerrarSessao)
    window.addEventListener('storage', sincronizarSessao)
    return () => {
      window.removeEventListener('gencand:unauthorized', encerrarSessao)
      window.removeEventListener('storage', sincronizarSessao)
    }
  }, [])

  async function login(email: string, senha: string): Promise<void> {
    const resposta = await authService.login({ email, senha })
    salvarToken(resposta.accessToken)
    setToken(resposta.accessToken)
  }

  function logout(): void {
    removerToken()
    setToken(null)
  }

  async function registrar(email: string, senha: string): Promise<string> {
    return (await authService.registrar({ email, senha })).mensagem
  }

  async function confirmarEmail(tokenConfirmacao: string): Promise<string> {
    return (await authService.confirmarEmail({ token: tokenConfirmacao })).mensagem
  }

  async function reenviarConfirmacao(email: string): Promise<string> {
    return (await authService.reenviarConfirmacao({ email })).mensagem
  }

  const value: AuthContextValue = {
    token, autenticado: Boolean(token), login, logout, registrar, confirmarEmail, reenviarConfirmacao,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
