import { apiRequest } from '../apiClient'
import type { CandidaturaAtualizacaoRequest, CandidaturaRequest, CandidaturaResponse, CandidaturaStatusRequest, Pagina } from '../../types/candidatura'

export const candidaturaService = {
  listar(page = 0, size = 20): Promise<Pagina<CandidaturaResponse>> {
    const parametros = new URLSearchParams({ page: String(page), size: String(size) })
    return apiRequest<Pagina<CandidaturaResponse>>(`/candidaturas?${parametros.toString()}`)
  },
  buscarPorId(id: string): Promise<CandidaturaResponse> {
    return apiRequest<CandidaturaResponse>(`/candidaturas/${id}`)
  },
  criar(dados: CandidaturaRequest): Promise<CandidaturaResponse> {
    return apiRequest<CandidaturaResponse>('/candidaturas', { method: 'POST', body: dados })
  },
  atualizar(id: string, dados: CandidaturaAtualizacaoRequest): Promise<CandidaturaResponse> {
    return apiRequest<CandidaturaResponse>(`/candidaturas/${id}`, { method: 'PUT', body: dados })
  },
  atualizarStatus(id: string, dados: CandidaturaStatusRequest): Promise<CandidaturaResponse> {
    return apiRequest<CandidaturaResponse>(`/candidaturas/${id}/status`, { method: 'PATCH', body: dados })
  },
  excluir(id: string): Promise<void> {
    return apiRequest<void>(`/candidaturas/${id}`, { method: 'DELETE' })
  },
}
