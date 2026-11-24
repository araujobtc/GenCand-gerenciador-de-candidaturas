const API_URL = import.meta.env.GENCAND_API_URL?.replace(/\/+$/, '')
const CHAVE_TOKEN = 'gencand_access_token'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  authenticated?: boolean
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_URL) throw new Error('A URL da API não foi configurada. Defina GENCAND_API_URL.')

  const { method = 'GET', body, authenticated = true } = options
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  if (authenticated && typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem(CHAVE_TOKEN)
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const responseText = await response.text()
  let responseBody: unknown
  if (responseText) {
    try { responseBody = JSON.parse(responseText) } catch { responseBody = responseText }
  }

  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      removerToken()
      window.dispatchEvent(new Event('gencand:unauthorized'))
    }

    const bodyRecord = typeof responseBody === 'object' && responseBody !== null
      ? responseBody as Record<string, unknown>
      : undefined
    const message =
      (typeof bodyRecord?.mensagem === 'string' && bodyRecord.mensagem) ||
      (typeof bodyRecord?.message === 'string' && bodyRecord.message) ||
      (typeof responseBody === 'string' && responseBody) ||
      'Não foi possível concluir a solicitação.'
    throw new ApiError(message, response.status)
  }

  return responseBody as T
}

export function salvarToken(token: string): void {
  sessionStorage.setItem(CHAVE_TOKEN, token)
}

export function removerToken(): void {
  sessionStorage.removeItem(CHAVE_TOKEN)
}
