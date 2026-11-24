export function formatarData(data: string | null | undefined): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('T')[0].split('-')
  if (!ano || !mes || !dia) return data
  return dia + '/' + mes + '/' + ano
}

export function aplicarMascaraData(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return digitos.slice(0, 2) + '/' + digitos.slice(2)
  return digitos.slice(0, 2) + '/' + digitos.slice(2, 4) + '/' + digitos.slice(4)
}

export function converterDataParaISO(data: string): string | null {
  if (!data.trim()) return null
  const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data)
  if (!correspondencia) throw new Error('Informe uma data válida no formato dd/MM/aaaa.')
  const [, diaTexto, mesTexto, anoTexto] = correspondencia
  const dia = Number(diaTexto)
  const mes = Number(mesTexto)
  const ano = Number(anoTexto)
  const dataVerificada = new Date(Date.UTC(ano, mes - 1, dia))
  if (dataVerificada.getUTCFullYear() !== ano || dataVerificada.getUTCMonth() !== mes - 1 || dataVerificada.getUTCDate() !== dia) {
    throw new Error('Informe uma data válida no formato dd/MM/aaaa.')
  }
  return anoTexto + '-' + mesTexto + '-' + diaTexto
}


export function formatarDataHoraLocal(valor: string | null | undefined): string {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR')
}
