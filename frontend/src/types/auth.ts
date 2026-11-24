export interface LoginRequest { email: string; senha: string }
export interface RegistroRequest { email: string; senha: string }
export interface ConfirmacaoEmailRequest { token: string }
export interface ReenvioConfirmacaoRequest { email: string }
export interface AuthResponse { accessToken: string; tokenType: string; expiresIn: number }
export interface MensagemResponse { mensagem: string }
