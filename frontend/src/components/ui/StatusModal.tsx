import { useState } from 'react'
import { candidaturaService } from '../../api/services/candidaturaService'
import type { CandidaturaResponse, StatusCandidatura } from '../../types/candidatura'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { Banner } from './Feedback'
import { STATUS_ANDAMENTO, STATUS_FINAIS } from './status'
import styles from './StatusModal.module.css'
import ui from './ui.module.css'

interface Props {
  candidatura: Pick<CandidaturaResponse, 'id' | 'titulo' | 'empresa' | 'status'>
  onClose: () => void
  onSaved: (atualizada: CandidaturaResponse) => void
}

export default function StatusModal({ candidatura, onClose, onSaved }: Props) {
  const [escolhido, setEscolhido] = useState<StatusCandidatura | null>(candidatura.status)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!escolhido) return
    setSalvando(true); setErro('')
    try {
      onSaved(await candidaturaService.atualizarStatus(candidatura.id, { status: escolhido }))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o status.')
      setSalvando(false)
    }
  }

  function grupo(titulo: string, itens: StatusCandidatura[]) {
    return (
      <fieldset className={styles.group}>
        <legend>{titulo}</legend>
        {itens.map(s => (
          <label key={s} className={`${styles.option} ${escolhido === s ? styles.selected : ''}`}>
            <input type="radio" name="status" value={s} checked={escolhido === s} onChange={() => setEscolhido(s)} />
            <StatusBadge status={s} />
          </label>
        ))}
      </fieldset>
    )
  }

  return (
    <Modal
      title="Alterar status" subtitle={`${candidatura.titulo} · ${candidatura.empresa}`} onClose={onClose} wide
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose}>Cancelar</button>
        <button type="button" className={ui.primary} onClick={() => void salvar()} disabled={salvando || !escolhido || escolhido === candidatura.status}>
          {salvando ? 'Salvando…' : 'Salvar status'}
        </button>
      </>}
    >
      <div className={styles.columns}>
        {grupo('Em andamento', STATUS_ANDAMENTO)}
        {grupo('Finais', STATUS_FINAIS)}
      </div>
      {erro && <div style={{ marginTop: 14 }}><Banner tom="Error" role="alert">{erro}</Banner></div>}
    </Modal>
  )
}
