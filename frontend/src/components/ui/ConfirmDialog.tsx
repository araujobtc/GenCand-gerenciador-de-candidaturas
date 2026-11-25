import { useState, type ReactNode } from 'react'
import Modal from './Modal'
import { Banner } from './Feedback'
import ui from './ui.module.css'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
  perigo?: boolean
}

/** Diálogo de confirmação com estado de envio e erro. */
export default function ConfirmDialog({ title, subtitle, children, confirmLabel, onConfirm, onClose, perigo = true }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function confirmar() {
    setEnviando(true); setErro('')
    try { await onConfirm() }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível concluir a ação.'); setEnviando(false) }
  }

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose} data-autofocus>Cancelar</button>
        <button type="button" className={perigo ? ui.danger : ui.primary} onClick={() => void confirmar()} disabled={enviando}>{enviando ? 'Aguarde…' : confirmLabel}</button>
      </>}>
      <div style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.5 }}>{children}</div>
      {erro && <div style={{ marginTop: 14 }}><Banner tom="Error" role="alert">{erro}</Banner></div>}
    </Modal>
  )
}
