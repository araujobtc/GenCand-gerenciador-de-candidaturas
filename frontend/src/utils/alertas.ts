import type { CandidaturaResponse } from '../types/candidatura'
import { contaParaParada } from '../components/ui/status'
import { diasDesde } from './tempo'

export type TipoAlerta = 'parada' | 'sem-status'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  titulo: string
  descricao: string
  data: string // instante ISO usado na ordenação
  candidaturaId: string
}

/**
 * Alertas calculados no navegador a partir das candidaturas (a API ainda não tem tabela de notificações).
 * Seguem as regras do planejamento: "sem status" dispara sempre; "parada" só para status em andamento
 * (exceto banco de talentos) depois do prazo configurado.
 */
export function calcularAlertas(candidaturas: CandidaturaResponse[], diasParaParada: number, agora = new Date()): Alerta[] {
  const alertas: Alerta[] = []
  for (const c of candidaturas) {
    const base = c.dataAtualizacao ?? agora.toISOString()
    const dias = diasDesde(c.dataAtualizacao, agora)
    if (c.status === null) {
      alertas.push({
        id: `sem-status:${c.id}:${base}`, tipo: 'sem-status', titulo: 'Sem status',
        descricao: `${c.titulo} (${c.empresa}) ainda não tem status. Defina para não perder o acompanhamento.`,
        data: base, candidaturaId: c.id,
      })
    } else if (contaParaParada(c.status) && dias !== null && dias >= diasParaParada) {
      const vencimento = new Date(new Date(base).getTime() + diasParaParada * 86_400_000).toISOString()
      alertas.push({
        id: `parada:${c.id}:${base}`, tipo: 'parada', titulo: 'Candidatura parada',
        descricao: `${c.titulo} (${c.empresa}) está sem atualização há ${dias} dias.`,
        data: vencimento, candidaturaId: c.id,
      })
    }
  }
  return alertas.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10)
}
