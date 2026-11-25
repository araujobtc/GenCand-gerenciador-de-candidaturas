import { instanteDeBrasilia } from '../../utils/tempo'

export const tiposEntrevista = [
  { valor: 'RH', rotulo: 'RH' },
  { valor: 'TECNICA', rotulo: 'Técnica' },
  { valor: 'GESTOR', rotulo: 'Com o gestor' },
  { valor: 'GRUPO', rotulo: 'Em grupo' },
  { valor: 'FINAL', rotulo: 'Final' },
  { valor: 'OUTRA', rotulo: 'Outra' },
]

export function rotuloTipoEntrevista(tipo: string): string {
  return tiposEntrevista.find(t => t.valor === tipo)?.rotulo ?? tipo
}

export const plataformasChamada = ['Microsoft Teams', 'Google Meet', 'Zoom', 'Telefone', 'Outra']

/** Opções de lembrete, em minutos antes da entrevista. */
export const opcoesLembrete = [10080, 2880, 1440, 120, 60, 30]

export function instanceDeBrasiliaSafe(data: string, hora: string): string {
  return instanteDeBrasilia(data, hora)
}
