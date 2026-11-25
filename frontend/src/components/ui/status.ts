import type { StatusCandidatura } from '../../types/candidatura'

export type StatusTom = 'gray' | 'blue' | 'amber' | 'purple' | 'teal' | 'coral'
export type StatusGrupo = 'andamento' | 'final'

export interface StatusInfo { label: string; grupo: StatusGrupo; tom: StatusTom }

export const STATUS: Record<StatusCandidatura, StatusInfo> = {
  BANCO_DE_TALENTOS: { label: 'Banco de talentos', grupo: 'andamento', tom: 'gray' },
  CANDIDATADA: { label: 'Candidatada', grupo: 'andamento', tom: 'blue' },
  ATIVIDADE_PENDENTE: { label: 'Atividade pendente', grupo: 'andamento', tom: 'amber' },
  ATIVIDADE_REALIZADA: { label: 'Atividade realizada', grupo: 'andamento', tom: 'blue' },
  ENTREVISTADA: { label: 'Entrevistada', grupo: 'andamento', tom: 'purple' },
  AGUARDANDO_RESULTADO: { label: 'Aguardando resultado', grupo: 'andamento', tom: 'purple' },
  PASSEI: { label: 'Passei', grupo: 'final', tom: 'teal' },
  NAO_PASSEI: { label: 'Não passei', grupo: 'final', tom: 'coral' },
  VAGA_ENCERRADA: { label: 'Vaga encerrada', grupo: 'final', tom: 'gray' },
  SUMIU: { label: 'Sumiu', grupo: 'final', tom: 'gray' },
  DESISTI: { label: 'Desisti', grupo: 'final', tom: 'gray' },
}

export const STATUS_ANDAMENTO = (Object.keys(STATUS) as StatusCandidatura[]).filter(s => STATUS[s].grupo === 'andamento')
export const STATUS_FINAIS = (Object.keys(STATUS) as StatusCandidatura[]).filter(s => STATUS[s].grupo === 'final')
export const STATUS_TODOS = [...STATUS_ANDAMENTO, ...STATUS_FINAIS]

/** Status em andamento que entram no alerta de candidatura parada (banco de talentos não tem prazo). */
export function contaParaParada(status: StatusCandidatura | null): boolean {
  return status !== null && STATUS[status].grupo === 'andamento' && status !== 'BANCO_DE_TALENTOS'
}

export function rotuloStatus(status: string | null | undefined): string {
  if (!status || status === 'SEM_STATUS') return 'Sem status'
  return STATUS[status as StatusCandidatura]?.label ?? status
}
