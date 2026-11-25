import { useEffect } from 'react'

export function useAutoLimpar(valor: string, setValor: (v: string) => void, ms = 5000) {
  useEffect(() => {
    if (!valor) return
    const t = window.setTimeout(() => setValor(''), ms)
    return () => window.clearTimeout(t)
  }, [valor, setValor, ms])
}
