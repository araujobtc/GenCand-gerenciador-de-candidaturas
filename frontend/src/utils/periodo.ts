export type TipoPeriodo = 'MES' | 'SEMESTRE' | 'ANO'

export interface Periodo {
  chave: string
  tipo: TipoPeriodo
  inicio: string // yyyy-MM-dd
  fim: string
  rotulo: string
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const dois = (n: number) => String(n).padStart(2, '0')
const iso = (ano: number, mes: number, dia: number) => `${ano}-${dois(mes)}-${dois(dia)}`
const ultimoDia = (ano: number, mes: number) => new Date(Date.UTC(ano, mes, 0)).getUTCDate()

export function criarPeriodo(tipo: TipoPeriodo, ano: number, indice: number): Periodo {
  if (tipo === 'MES') {
    return { chave: `M-${ano}-${indice}`, tipo, inicio: iso(ano, indice, 1), fim: iso(ano, indice, ultimoDia(ano, indice)), rotulo: `${MESES[indice - 1]} de ${ano}` }
  }
  if (tipo === 'SEMESTRE') {
    const mesIni = indice === 1 ? 1 : 7
    const mesFim = indice === 1 ? 6 : 12
    return { chave: `S-${ano}-${indice}`, tipo, inicio: iso(ano, mesIni, 1), fim: iso(ano, mesFim, ultimoDia(ano, mesFim)), rotulo: `${indice}º semestre de ${ano}` }
  }
  return { chave: `A-${ano}`, tipo, inicio: iso(ano, 1, 1), fim: iso(ano, 12, 31), rotulo: String(ano) }
}

/** Data de referência no fuso de Brasília, para "este mês/semestre/ano" não depender do fuso do navegador. */
function hojeBrasilia(ref = new Date()): { ano: number; mes: number } {
  const [ano, mes] = ref.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).split('-').map(Number)
  return { ano, mes }
}

export function periodoAtual(tipo: TipoPeriodo, ref = new Date()): Periodo {
  const { ano, mes } = hojeBrasilia(ref)
  if (tipo === 'MES') return criarPeriodo('MES', ano, mes)
  if (tipo === 'SEMESTRE') return criarPeriodo('SEMESTRE', ano, mes <= 6 ? 1 : 2)
  return criarPeriodo('ANO', ano, 0)
}

export function periodoAnterior(tipo: TipoPeriodo, ref = new Date()): Periodo {
  const { ano, mes } = hojeBrasilia(ref)
  if (tipo === 'MES') return mes === 1 ? criarPeriodo('MES', ano - 1, 12) : criarPeriodo('MES', ano, mes - 1)
  if (tipo === 'SEMESTRE') return mes <= 6 ? criarPeriodo('SEMESTRE', ano - 1, 2) : criarPeriodo('SEMESTRE', ano, 1)
  return criarPeriodo('ANO', ano - 1, 0)
}

/** Opções oferecidas no seletor (mínimo: mês; máximo: ano). */
export function opcoesPeriodo(ref = new Date()): Periodo[] {
  return (['MES', 'SEMESTRE', 'ANO'] as TipoPeriodo[]).flatMap(t => [periodoAtual(t, ref), periodoAnterior(t, ref)])
}

export function rotuloCurto(p: Periodo): string {
  if (p.tipo === 'SEMESTRE') return p.rotulo.replace(' semestre de ', ' sem. ')
  return p.rotulo
}

export function estaNoPeriodo(dataIso: string | null, p: Periodo): boolean {
  if (!dataIso) return false
  const dia = dataIso.slice(0, 10)
  return dia >= p.inicio && dia <= p.fim
}
