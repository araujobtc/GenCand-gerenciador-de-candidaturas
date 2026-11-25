import { createContext } from 'react'
import type { Preferencias } from '../../api/services/workspaceService'
import type { Alerta } from '../../utils/alertas'

export interface WorkspaceContextValue {
  preferencias: Preferencias | null
  atualizarPreferenciasLocal: (p: Preferencias) => void
  alertas: Alerta[]
  lidas: ReadonlySet<string>
  naoLidas: number
  marcarLida: (id: string) => void
  marcarTodasLidas: () => void
  /** Recalcula os alertas; chame depois de mudar status, datas ou excluir candidaturas. */
  recarregarAlertas: () => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)
