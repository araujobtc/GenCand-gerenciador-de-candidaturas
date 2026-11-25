import { useEffect, useState } from 'react'

export function useMediaQuery(consulta: string): boolean {
  const [corresponde, setCorresponde] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const lista = window.matchMedia(consulta)
    const aoMudar = () => setCorresponde(lista.matches)
    aoMudar()
    lista.addEventListener('change', aoMudar)
    return () => lista.removeEventListener('change', aoMudar)
  }, [consulta])
  return corresponde
}
