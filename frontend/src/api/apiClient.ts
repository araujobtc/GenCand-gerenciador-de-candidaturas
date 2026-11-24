const API_URL = import.meta.env.GENCAND_API_URL?.replace(/\/+$/, '')
export const CHAVE_TOKEN = 'gencand_access_token'

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status }
}

type ApiRequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; authenticated?: boolean }

function extrairMensagemErro(corpo: unknown): string | undefined {
  if (typeof corpo === 'string' && corpo.trim()) return corpo
  if (typeof corpo !== 'object' || corpo === null) return undefined
  const registro = corpo as Record<string, unknown>
  for (const campo of ['mensagem', 'message', 'detail', 'title']) {
    const valor = registro[campo]
    if (typeof valor === 'string' && valor.trim()) return valor
  }
  const erros = registro.errors
  if (Array.isArray(erros)) {
    const mensagens = erros.map(erro => {
      if (typeof erro === 'string') return erro
      if (typeof erro === 'object' && erro !== null) { const item = erro as Record<string, unknown>; return item.defaultMessage ?? item.message ?? item.detail }
      return undefined
    }).filter((valor): valor is string => typeof valor === 'string' && Boolean(valor.trim()))
    if (mensagens.length) return mensagens.join(' ')
  }
  if (typeof erros === 'object' && erros !== null) {
    const mensagens = Object.values(erros).flatMap(valor => Array.isArray(valor) ? valor : [valor]).filter((valor): valor is string => typeof valor === 'string' && Boolean(valor.trim()))
    if (mensagens.length) return mensagens.join(' ')
  }
  return undefined
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_URL) throw new ApiError('O endereço da API não foi configurado. Verifique as configurações do aplicativo.', 0)
  const { method = 'GET', body, authenticated = true } = options
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (authenticated && typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem(CHAVE_TOKEN)
    if (token) headers.set('Authorization', 'Bearer ' + token)
  }
  let response: Response
  try { response = await fetch(API_URL + '/api' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }) }
  catch { throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.', 0) }
  if (response.status === 204) return undefined as T
  const responseText = await response.text()
  let responseBody: unknown
  if (responseText) { try { responseBody = JSON.parse(responseText) } catch { responseBody = responseText } }
  if (!response.ok) {
    if (response.status === 401 && authenticated) { removerToken(); window.dispatchEvent(new Event('gencand:unauthorized')) }
    throw new ApiError(extrairMensagemErro(responseBody) ?? 'Não foi possível concluir a solicitação. Tente novamente.', response.status)
  }
  return responseBody as T
}

export function salvarToken(token: string): void { sessionStorage.setItem(CHAVE_TOKEN, token) }
export function removerToken(): void { sessionStorage.removeItem(CHAVE_TOKEN) }