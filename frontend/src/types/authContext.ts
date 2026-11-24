export interface AuthContextValue {
  token: string | null
  autenticado: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  registrar: (email: string, senha: string) => Promise<string>
  confirmarEmail: (token: string) => Promise<string>
  reenviarConfirmacao: (email: string) => Promise<string>
}
