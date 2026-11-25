import type { Plataforma } from '../api/services/workspaceService'

function normalizarDominio(valor: string): string {
  return valor.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0]
}

/** Descobre a plataforma pelo domínio do link da vaga, usando os domínios cadastrados. */
export function reconhecerPlataforma(link: string, plataformas: Plataforma[]): Plataforma | null {
  let host: string
  try { host = normalizarDominio(new URL(link).hostname) } catch { return null }
  if (!host) return null
  const candidatas = plataformas
    .filter(p => !p.oculta && p.dominio)
    .map(p => ({ p, dominio: normalizarDominio(p.dominio as string) }))
    .filter(({ dominio }) => dominio && (host === dominio || host.endsWith('.' + dominio)))
    .sort((a, b) => b.dominio.length - a.dominio.length)
  return candidatas[0]?.p ?? null
}
