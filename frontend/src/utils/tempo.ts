const FUSO = 'America/Sao_Paulo'

/** yyyy-MM-dd de um instante, no horário de Brasília. */
export function diaBrasilia(valor: string | Date): string {
  return new Date(valor).toLocaleDateString('en-CA', { timeZone: FUSO })
}

export function diasDesde(instante: string | null | undefined, agora = new Date()): number | null {
  if (!instante) return null
  const a = Date.parse(diaBrasilia(agora) + 'T00:00:00Z')
  const b = Date.parse(diaBrasilia(instante) + 'T00:00:00Z')
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.max(0, Math.round((a - b) / 86_400_000))
}

export function rotuloRelativo(dias: number | null): string {
  if (dias === null) return '—'
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Ontem'
  return `Há ${dias} dias`
}

export function formatarInstante(valor: string | null | undefined): string {
  if (!valor) return '—'
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR', { timeZone: FUSO })
}

export function formatarInstanteHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' })
}

export function formatarDiaSemanaData(valor: string): string {
  const d = new Date(valor)
  const dia = d.toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'long' })
  const data = d.toLocaleDateString('pt-BR', { timeZone: FUSO })
  const hora = d.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1).replace('-feira', '')}, ${data} · ${hora}`
}

/** Converte data (yyyy-MM-dd) + hora (HH:mm) digitadas em Brasília para um instante ISO (UTC). Brasil não tem horário de verão desde 2019: UTC-3. */
export function instanteDeBrasilia(data: string, hora: string): string {
  return new Date(`${data}T${hora}:00-03:00`).toISOString()
}

export function partesBrasilia(valor: string): { data: string; hora: string } {
  const d = new Date(valor)
  return {
    data: d.toLocaleDateString('en-CA', { timeZone: FUSO }),
    hora: d.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

export function rotuloLembrete(minutos: number): string {
  if (minutos % 10080 === 0) { const n = minutos / 10080; return n === 1 ? '1 semana antes' : `${n} semanas antes` }
  if (minutos % 1440 === 0) { const n = minutos / 1440; return n === 1 ? '1 dia antes' : `${n} dias antes` }
  if (minutos % 60 === 0) { const n = minutos / 60; return n === 1 ? '1 hora antes' : `${n} horas antes` }
  return `${minutos} min antes`
}
