import { apiRequest } from '../apiClient'
import type { AuthResponse, ConfirmacaoEmailRequest, LoginRequest, MensagemResponse, RegistroRequest, ReenvioConfirmacaoRequest } from '../../types/auth'

export const authService = {
  login(dados: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: dados, authenticated: false })
  },
  registrar(dados: RegistroRequest): Promise<MensagemResponse> {
    return apiRequest<MensagemResponse>('/auth/register', { method: 'POST', body: dados, authenticated: false })
  },
  confirmarEmail(dados: ConfirmacaoEmailRequest): Promise<MensagemResponse> {
    return apiRequest<MensagemResponse>('/auth/confirm-email', { method: 'POST', body: dados, authenticated: false })
  },
  reenviarConfirmacao(dados: ReenvioConfirmacaoRequest): Promise<MensagemResponse> {
    return apiRequest<MensagemResponse>('/auth/resend-confirmation', { method: 'POST', body: dados, authenticated: false })
  },
  solicitarRecuperacaoSenha(email: string): Promise<MensagemResponse> {
    return apiRequest<MensagemResponse>('/auth/forgot-password', { method: 'POST', body: { email }, authenticated: false })
  },
  redefinirSenha(token: string, novaSenha: string): Promise<MensagemResponse> {
    return apiRequest<MensagemResponse>('/auth/reset-password', { method: 'POST', body: { token, novaSenha }, authenticated: false })
  },
}
