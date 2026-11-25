export type StatusCandidatura =
  | 'BANCO_DE_TALENTOS' | 'CANDIDATADA' | 'ATIVIDADE_PENDENTE' | 'ATIVIDADE_REALIZADA'
  | 'ENTREVISTADA' | 'AGUARDANDO_RESULTADO' | 'PASSEI' | 'NAO_PASSEI'
  | 'VAGA_ENCERRADA' | 'SUMIU' | 'DESISTI'

export interface CandidaturaResponse {
  id: string
  titulo: string
  empresa: string
  link: string | null
  plataformaId: string | null
  plataformaNome: string | null
  dataCandidatura: string | null
  dataAtualizacao: string | null
  status: StatusCandidatura | null
  observacao: string | null
}

export interface CandidaturaRequest {
  titulo: string
  empresa: string
  link?: string | null
  plataformaId?: string | null
  dataCandidatura?: string | null
  status?: StatusCandidatura | null
  observacao?: string | null
}

export interface CandidaturaAtualizacaoRequest {
  titulo: string
  empresa: string
  link?: string | null
  plataformaId?: string | null
  dataCandidatura?: string | null
  observacao?: string | null
}

export interface CandidaturaStatusRequest { status: StatusCandidatura }

export interface PageMetadata {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface Pagina<T> {
  content: T[]
  page: PageMetadata
}

export interface HistoricoStatusItem {
  statusAnterior: StatusCandidatura | null
  statusNovo: StatusCandidatura
  alteradoEm: string
}
