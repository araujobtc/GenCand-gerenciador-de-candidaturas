import { useState, type FormEvent } from 'react'
import { contatoService, type Contato } from '../../api/services/workspaceService'
import Modal from '../ui/Modal'
import Icon from '../ui/Icon'
import { Banner } from '../ui/Feedback'
import ui from '../ui/ui.module.css'

interface Props {
  candidaturaId: string
  titulo: string
  /** Quando informado, edita só a observação deste contato (ela é ligada à candidatura). */
  contato: Contato | null
  onClose: () => void
  onSaved: () => void
}

export default function ContatoModal({ candidaturaId, titulo, contato, onClose, onSaved }: Props) {
  const editando = contato !== null
  const [nome, setNome] = useState(contato?.nome ?? '')
  const [cargo, setCargo] = useState(contato?.cargo ?? '')
  const [email, setEmail] = useState(contato?.email ?? '')
  const [telefone, setTelefone] = useState(contato?.telefone ?? '')
  const [linkedin, setLinkedin] = useState(contato?.linkedin ?? '')
  const [observacao, setObservacao] = useState(contato?.observacao ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(''); setEnviando(true)
    try {
      if (contato) await contatoService.atualizarObservacao(candidaturaId, contato.id, observacao.trim())
      else await contatoService.vincular(candidaturaId, {
        nome: nome.trim(), cargo: cargo.trim() || undefined, email: email.trim() || undefined,
        telefone: telefone.trim() || undefined, linkedin: linkedin.trim() || undefined, observacao: observacao.trim() || undefined,
      })
      onSaved()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o contato.')
      setEnviando(false)
    }
  }

  return (
    <Modal title={editando ? 'Editar observação do contato' : 'Adicionar contato'} subtitle={editando ? `${contato.nome} · ${titulo}` : titulo} onClose={onClose} wide
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose}>Cancelar</button>
        <button type="submit" form="form-contato" className={ui.primary} disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar contato'}</button>
      </>}>
      <form id="form-contato" onSubmit={e => void salvar(e)} style={{ display: 'grid', gap: 16 }}>
        {!editando && (
          <>
            <div className={ui.grid2}>
              <div className={ui.field}><label className={ui.label} htmlFor="c-nome">Nome</label><input id="c-nome" className={ui.control} required maxLength={160} value={nome} onChange={e => setNome(e.target.value)} /></div>
              <div className={ui.field}><label className={ui.label} htmlFor="c-cargo">Cargo</label><input id="c-cargo" className={ui.control} maxLength={120} value={cargo} onChange={e => setCargo(e.target.value)} /></div>
              <div className={ui.field}><label className={ui.label} htmlFor="c-email">E-mail</label><span className={ui.withIcon}><Icon name="email" /><input id="c-email" className={ui.control} type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></span></div>
              <div className={ui.field}><label className={ui.label} htmlFor="c-tel">Telefone</label><span className={ui.withIcon}><Icon name="telefone" /><input id="c-tel" className={ui.control} type="tel" maxLength={40} value={telefone} onChange={e => setTelefone(e.target.value)} /></span></div>
            </div>
            <div className={ui.field}><label className={ui.label} htmlFor="c-in">LinkedIn</label><span className={ui.withIcon}><Icon name="link" /><input id="c-in" className={ui.control} type="url" maxLength={2048} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" /></span></div>
          </>
        )}
        <div className={ui.field}>
          <label className={ui.label} htmlFor="c-obs">Observação sobre este processo</label>
          <textarea id="c-obs" className={ui.control} maxLength={5000} rows={3} value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex.: me ligou dia 10 e disse que o retorno vem na semana que vem." />
          <p className={ui.hint}>Fica ligada só a esta candidatura, não à pessoa.</p>
        </div>
        {erro && <Banner tom="Error" role="alert">{erro}</Banner>}
      </form>
    </Modal>
  )
}
