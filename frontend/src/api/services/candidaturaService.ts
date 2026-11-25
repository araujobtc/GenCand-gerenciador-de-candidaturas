import { apiRequest } from '../apiClient'
import type { CandidaturaAtualizacaoRequest, CandidaturaRequest, CandidaturaResponse, CandidaturaStatusRequest, HistoricoStatusItem, Pagina } from '../../types/candidatura'

export const candidaturaService = {
  listar(page = 0, size = 20): Promise<Pagina<CandidaturaResponse>> {
    const parametros = new URLSearchParams({ page: String(page), size: String(size) })
    return apiRequest<Pagina<CandidaturaResponse>>(`/candidaturas?${parametros.toString()}`)
  },
  /** A API ainda não filtra: busca todas as páginas (máx. 100 por página) para filtrar e paginar na tela. */
  async listarTodas(): Promise<CandidaturaResponse[]> {
    const tamanho = 100
    const primeira = await this.listar(0, tamanho)
    const itens = [...primeira.content]
    for (let pagina = 1; pagina < primeira.page.totalPages; pagina++) {
      itens.push(...(await this.listar(pagina, tamanho)).content)
    }
    return itens
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
  verificarHoje(id: string): Promise<CandidaturaResponse> {
    return apiRequest<CandidaturaResponse>(`/candidaturas/${id}/verificar`, { method: 'PATCH' })
  },
  historico(id: string): Promise<HistoricoStatusItem[]> {
    return apiRequest<HistoricoStatusItem[]>(`/candidaturas/${id}/historico`)
  },
  ocultar(id: string): Promise<void> {
    return apiRequest<void>(`/candidaturas/${id}/ocultar`, { method: 'PATCH' })
  },
  excluir(id: string): Promise<void> {
    return apiRequest<void>(`/candidaturas/${id}`, { method: 'DELETE' })
  },
}
