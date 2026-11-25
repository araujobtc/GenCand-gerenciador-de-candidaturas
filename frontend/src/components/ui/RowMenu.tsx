import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from './Icon'
import styles from './RowMenu.module.css'

export interface RowMenuItem {
  label: string
  icon: IconName
  onSelect?: () => void
  href?: string
  external?: boolean
  danger?: boolean
}

/** Menu "três pontos". Usa posição fixa para não ser cortado pelo contêiner rolável da tabela. */
export default function RowMenu({ items, label }: { items: RowMenuItem[]; label: string }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const caixa = useRef<HTMLDivElement>(null)
  const fechar = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return
    function aoClicar(e: MouseEvent) {
      const alvo = e.target as Node
      if (!caixa.current?.contains(alvo) && !botao.current?.contains(alvo)) fechar()
    }
    function aoTeclar(e: KeyboardEvent) { if (e.key === 'Escape') { fechar(); botao.current?.focus() } }
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    window.addEventListener('scroll', fechar, true)
    window.addEventListener('resize', fechar)
    return () => {
      document.removeEventListener('mousedown', aoClicar); document.removeEventListener('keydown', aoTeclar)
      window.removeEventListener('scroll', fechar, true); window.removeEventListener('resize', fechar)
    }
  }, [pos, fechar])

  function alternar() {
    if (pos) { fechar(); return }
    const r = botao.current!.getBoundingClientRect()
    const abreParaCima = r.bottom + items.length * 44 + 16 > window.innerHeight
    setPos({ top: abreParaCima ? Math.max(8, r.top - items.length * 44 - 16) : r.bottom + 6, right: window.innerWidth - r.right })
  }

  return (
    <>
      <button ref={botao} type="button" className={styles.trigger} onClick={alternar} aria-haspopup="menu" aria-expanded={pos !== null} aria-label={label}>
        <Icon name="menu" />
      </button>
      {pos && (
        <div ref={caixa} className={styles.menu} role="menu" style={{ top: pos.top, right: pos.right }}>
          {items.map(item => {
            const conteudo = <><Icon name={item.icon} />{item.label}</>
            const classe = `${styles.item} ${item.danger ? styles.danger : ''}`
            return item.href
              ? <a key={item.label} role="menuitem" className={classe} href={item.href} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} onClick={fechar}>{conteudo}</a>
              : <button key={item.label} type="button" role="menuitem" className={classe} onClick={() => { fechar(); item.onSelect?.() }}>{conteudo}</button>
          })}
        </div>
      )}
    </>
  )
}
