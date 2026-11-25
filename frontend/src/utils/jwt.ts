/** Lê o e-mail do token só para exibir a conta no menu. Nada aqui valida o token: quem valida é a API. */
export function emailDoToken(token: string | null): string | null {
  if (!token) return null
  try {
    const carga = token.split('.')[1]
    if (!carga) return null
    const json = decodeURIComponent(escape(atob(carga.replace(/-/g, '+').replace(/_/g, '/'))))
    const email = (JSON.parse(json) as { email?: unknown }).email
    return typeof email === 'string' ? email : null
  } catch {
    return null
  }
}

export function nomeDoEmail(email: string | null): string {
  if (!email) return 'Minha conta'
  const parte = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  return parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : 'Minha conta'
}

export function iniciais(email: string | null): string {
  const nome = nomeDoEmail(email)
  const partes = nome.split(' ').filter(Boolean)
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : nome.slice(0, 2)
  return letras.toUpperCase()
}
