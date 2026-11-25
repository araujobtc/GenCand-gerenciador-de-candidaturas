import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { candidaturaService } from '../../api/services/candidaturaService'
import { preferenciasService, type Preferencias } from '../../api/services/workspaceService'
import { calcularAlertas } from '../../utils/alertas'
import { WorkspaceContext } from './WorkspaceContext'
import type { CandidaturaResponse } from '../../types/candidatura'

const CHAVE_LIDAS = 'notificacoes-lidas'
const PREFERENCIAS_PADRAO_DIAS = 7

function lerLidas(): Set<string> {
  try {
    const bruto = localStorage.getItem(CHAVE_LIDAS)
    const lista = bruto ? JSON.parse(bruto) : []
    return new Set(Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<Preferencias | null>(null)
  const [candidaturas, setCandidaturas] = useState<CandidaturaResponse[]>([])
  const [lidas, setLidas] = useState<Set<string>>(lerLidas)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true
    preferenciasService.obter().then(p => { if (ativo) setPreferencias(p) }).catch(() => { /* usa o padrão */ })
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    let ativo = true
    candidaturaService.listarTodas().then(lista => { if (ativo) setCandidaturas(lista) }).catch(() => { /* o sino fica vazio */ })
    return () => { ativo = false }
  }, [versao])

  const alertas = useMemo(
    () => calcularAlertas(candidaturas, preferencias?.diasParaParada ?? PREFERENCIAS_PADRAO_DIAS),
    [candidaturas, preferencias?.diasParaParada],
  )

  const persistir = useCallback((proximas: Set<string>) => {
    setLidas(proximas)
    try { localStorage.setItem(CHAVE_LIDAS, JSON.stringify([...proximas].slice(-500))) } catch { /* sem armazenamento */ }
  }, [])

  const marcarLida = useCallback((id: string) => persistir(new Set(lidas).add(id)), [lidas, persistir])
  const marcarTodasLidas = useCallback(() => persistir(new Set([...lidas, ...alertas.map(a => a.id)])), [alertas, lidas, persistir])
  const recarregarAlertas = useCallback(() => setVersao(v => v + 1), [])
  const naoLidas = alertas.filter(a => !lidas.has(a.id)).length

  const value = useMemo(() => ({
    preferencias, atualizarPreferenciasLocal: setPreferencias, alertas, lidas, naoLidas, marcarLida, marcarTodasLidas, recarregarAlertas,
  }), [preferencias, alertas, lidas, naoLidas, marcarLida, marcarTodasLidas, recarregarAlertas])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
