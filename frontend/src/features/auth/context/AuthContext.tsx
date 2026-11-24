import { createContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '../../../api/services/authService'
import { removerToken, salvarToken } from '../../../api/apiClient'
import type { AuthContextValue } from '../../../types/authContext'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const CHAVE_TOKEN = 'gencand_access_token'

type AuthProviderProps = { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(CHAVE_TOKEN))

  useEffect(() => {
    function encerrarSessao() {
      removerToken()
      setToken(null)
    }

    window.addEventListener('gencand:unauthorized', encerrarSessao)
    return () => window.removeEventListener('gencand:unauthorized', encerrarSessao)
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
