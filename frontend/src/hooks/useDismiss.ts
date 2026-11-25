import { useEffect, type RefObject } from 'react'

/** Fecha popovers ao clicar fora ou apertar Esc. */
export function useDismiss(ref: RefObject<HTMLElement | null>, aberto: boolean, fechar: () => void) {
  useEffect(() => {
    if (!aberto) return
    function aoClicar(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) fechar() }
    function aoTeclar(e: KeyboardEvent) { if (e.key === 'Escape') fechar() }
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    return () => { document.removeEventListener('mousedown', aoClicar); document.removeEventListener('keydown', aoTeclar) }
  }, [aberto, fechar, ref])
}
