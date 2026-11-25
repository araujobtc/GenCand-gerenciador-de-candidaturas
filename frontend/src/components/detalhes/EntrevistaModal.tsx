import { useState, type FormEvent } from 'react'
import { entrevistaService, type Entrevista } from '../../api/services/workspaceService'
import { instanceDeBrasiliaSafe, tiposEntrevista, plataformasChamada, opcoesLembrete } from './entrevistaConfig'
import { partesBrasilia, rotuloLembrete } from '../../utils/tempo'
import Modal from '../ui/Modal'
import Icon from '../ui/Icon'
import { Banner } from '../ui/Feedback'
import ui from '../ui/ui.module.css'

interface Props {
  candidaturaId: string
  titulo: string
  entrevista: Entrevista | null
  onClose: () => void
  onSaved: () => void
}

const PADRAO_LEMBRETE = 1440

export default function EntrevistaModal({ candidaturaId, titulo, entrevista, onClose, onSaved }: Props) {
  const inicial = entrevista ? partesBrasilia(entrevista.dataHora) : { data: '', hora: '' }
  const tipoInicial = entrevista && !tiposEntrevista.some(t => t.valor === entrevista.tipo) ? 'OUTRA' : entrevista?.tipo ?? 'RH'
  const plataformaInicial = entrevista?.plataformaChamada
    ? (plataformasChamada.includes(entrevista.plataformaChamada) ? entrevista.plataformaChamada : 'Outra')
    : ''

  const [tipo, setTipo] = useState(tipoInicial)
  const [tipoOutro, setTipoOutro] = useState(tipoInicial === 'OUTRA' && entrevista && entrevista.tipo !== 'OUTRA' ? entrevista.tipo : '')
  const [data, setData] = useState(inicial.data)
  const [hora, setHora] = useState(inicial.hora)
  const [plataforma, setPlataforma] = useState(plataformaInicial)
  const [plataformaOutra, setPlataformaOutra] = useState(plataformaInicial === 'Outra' ? entrevista?.plataformaChamada ?? '' : '')
  const [link, setLink] = useState(entrevista?.linkChamada ?? '')
  const [lembretes, setLembretes] = useState<number[]>(entrevista ? entrevista.lembretesMinutosAntes : [PADRAO_LEMBRETE])
  const [adicionando, setAdicionando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const disponiveis = opcoesLembrete.filter(m => !lembretes.includes(m))

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    const tipoFinal = tipo === 'OUTRA' ? (tipoOutro.trim() || 'OUTRA') : tipo
    const plataformaFinal = plataforma === 'Outra' ? (plataformaOutra.trim() || 'Outra') : plataforma
    setEnviando(true)
    try {
      const dados = {
        tipo: tipoFinal,
        dataHora: instanceDeBrasiliaSafe(data, hora),
        plataformaChamada: plataformaFinal || null,
        linkChamada: link.trim() || null,
      }
      const salva = entrevista
        ? await entrevistaService.atualizar(candidaturaId, entrevista.id, dados)
        : await entrevistaService.criar(candidaturaId, dados)
      // Ajusta os lembretes ao que foi escolhido (a API cria o padrão de um dia antes).
      const atuais = salva.lembretesMinutosAntes
      for (const m of lembretes.filter(x => !atuais.includes(x))) await entrevistaService.adicionarLembrete(candidaturaId, salva.id, m)
      for (const m of atuais.filter(x => !lembretes.includes(x))) await entrevistaService.removerLembrete(candidaturaId, salva.id, m)
      onSaved()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar a entrevista.')
      setEnviando(false)
    }
  }

  return (
    <Modal title={entrevista ? 'Editar entrevista' : 'Nova entrevista'} subtitle={titulo} onClose={onClose} wide
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose}>Cancelar</button>
        <button type="submit" form="form-entrevista" className={ui.primary} disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar entrevista'}</button>
      </>}>
      <form id="form-entrevista" onSubmit={e => void salvar(e)} style={{ display: 'grid', gap: 16 }}>
        <div className={ui.grid2}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ent-tipo">Tipo de entrevista</label>
            <select id="ent-tipo" className={ui.control} value={tipo} onChange={e => setTipo(e.target.value)}>
              {tiposEntrevista.map(t => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ent-data">Data</label>
            <input id="ent-data" className={ui.control} type="date" required value={data} onChange={e => setData(e.target.value)} />
          </div>
          {tipo === 'OUTRA' && (
            <div className={`${ui.field} ${ui.span2}`}>
              <label className={ui.label} htmlFor="ent-tipo-outro">Nome do tipo</label>
              <input id="ent-tipo-outro" className={ui.control} maxLength={40} value={tipoOutro} onChange={e => setTipoOutro(e.target.value)} placeholder="Ex.: Conversa com a diretoria" />
            </div>
          )}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ent-hora">Horário</label>
            <span className={ui.withIcon}><Icon name="relogio" /><input id="ent-hora" className={ui.control} type="time" required value={hora} onChange={e => setHora(e.target.value)} /></span>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="ent-plataforma">Plataforma da chamada</label>
            <select id="ent-plataforma" className={ui.control} value={plataforma} onChange={e => setPlataforma(e.target.value)}>
              <option value="">Não informada</option>
              {plataformasChamada.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {plataforma === 'Outra' && (
            <div className={`${ui.field} ${ui.span2}`}>
              <label className={ui.label} htmlFor="ent-plataforma-outra">Nome da plataforma</label>
              <input id="ent-plataforma-outra" className={ui.control} maxLength={40} value={plataformaOutra} onChange={e => setPlataformaOutra(e.target.value)} />
            </div>
          )}
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="ent-link">Link ou endereço</label>
          <span className={ui.withIcon}><Icon name="link" /><input id="ent-link" className={ui.control} maxLength={2048} value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/… ou endereço" /></span>
        </div>
        <div>
          <span className={ui.label}>Lembretes</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {lembretes.sort((a, b) => b - a).map(m => (
              <span key={m} className={`${ui.chip} ${ui.chipBlue}`}>
                {rotuloLembrete(m)}
                <button type="button" className={ui.chipX} onClick={() => setLembretes(l => l.filter(x => x !== m))} aria-label={`Remover lembrete de ${rotuloLembrete(m)}`}><Icon name="fechar" size={14} /></button>
              </span>
            ))}
            {adicionando ? (
              <select className={ui.control} style={{ width: 'auto', minHeight: 32 }} autoFocus value="" onChange={e => { if (e.target.value) setLembretes(l => [...l, Number(e.target.value)]); setAdicionando(false) }} onBlur={() => setAdicionando(false)} aria-label="Escolher lembrete">
                <option value="">Escolha…</option>
                {disponiveis.map(m => <option key={m} value={m}>{rotuloLembrete(m)}</option>)}
              </select>
            ) : (
              <button type="button" className={ui.chipBtn} onClick={() => setAdicionando(true)} disabled={disponiveis.length === 0}><Icon name="mais" size={14} />Adicionar lembrete</button>
            )}
          </div>
          <p className={ui.hint}>O lembrete de um dia antes já vem marcado e pode ser removido.</p>
        </div>
        {!entrevista && <Banner tom="Purple">Ao salvar, o status da candidatura muda para Entrevistada.</Banner>}
        {erro && <Banner tom="Error" role="alert">{erro}</Banner>}
      </form>
    </Modal>
  )
}
