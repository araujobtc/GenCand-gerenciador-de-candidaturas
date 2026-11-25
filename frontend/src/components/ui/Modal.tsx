import { useEffect, useId, useRef, type ReactNode } from 'react'
import Icon from './Icon'
import styles from './ui.module.css'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Diálogo acessível: foco preso, Esc fecha, devolve o foco ao elemento anterior. No celular vira bottom sheet. */
export default function Modal({ title, subtitle, onClose, children, footer, wide }: ModalProps) {
  const tituloId = useId()
  const caixa = useRef<HTMLDivElement>(null)
  const aoFechar = useRef(onClose)
  useEffect(() => { aoFechar.current = onClose })

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const raiz = caixa.current
    const primeiro = raiz?.querySelector<HTMLElement>('[data-autofocus]') ?? raiz?.querySelector<HTMLElement>(FOCAVEIS)
    primeiro?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function teclado(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); aoFechar.current(); return }
      if (e.key !== 'Tab' || !raiz) return
      const itens = Array.from(raiz.querySelectorAll<HTMLElement>(FOCAVEIS))
      if (itens.length === 0) return
      const ini = itens[0]; const fim = itens[itens.length - 1]
      if (e.shiftKey && document.activeElement === ini) { e.preventDefault(); fim.focus() }
      else if (!e.shiftKey && document.activeElement === fim) { e.preventDefault(); ini.focus() }
    }
    document.addEventListener('keydown', teclado)
    return () => {
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = overflow
      anterior?.focus()
    }
  }, [])

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={caixa} className={`${styles.dialog} ${wide ? styles.dialogWide : ''}`} role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <div className={styles.grabber} aria-hidden="true" />
        <div className={styles.dialogHead}>
          <div>
            <h2 id={tituloId} className={styles.dialogTitle}>{title}</h2>
            {subtitle && <p className={styles.dialogSub}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar"><Icon name="fechar" /></button>
        </div>
        <div className={styles.dialogBody}>{children}</div>
        {footer && <div className={styles.dialogFoot}>{footer}</div>}
      </div>
    </div>
  )
}
