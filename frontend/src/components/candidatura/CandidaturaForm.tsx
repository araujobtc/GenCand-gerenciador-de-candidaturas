import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { plataformaService, type Plataforma } from '../../api/services/workspaceService'
import type { CandidaturaAtualizacaoRequest, StatusCandidatura } from '../../types/candidatura'
import { STATUS, STATUS_TODOS } from '../ui/status'
import { aplicarMascaraData, converterDataParaISO } from '../../utils/date'
import { reconhecerPlataforma } from '../../utils/plataforma'
import Icon from '../ui/Icon'
import { Banner } from '../ui/Feedback'
import ui from '../ui/ui.module.css'
import styles from './CandidaturaForm.module.css'

export interface CandidaturaFormValores {
  titulo: string
  empresa: string
  link: string
  /** null = a usuária ainda não escolheu; vale o que o link reconhecer. '' = escolheu "Não informada". */
  plataformaId: string | null
  dataCandidatura: string // dd/MM/aaaa
  observacao: string
}

interface Props {
  valoresIniciais: CandidaturaFormValores
  textoSalvar: string
  textoSalvando: string
  cancelarPara: string
  aviso?: ReactNode
  statusInicial?: StatusCandidatura | null
  permitirAlterarStatus?: boolean
  onSubmit: (dados: CandidaturaAtualizacaoRequest, status?: StatusCandidatura) => Promise<void>
}

export default function CandidaturaForm({ valoresIniciais, textoSalvar, textoSalvando, cancelarPara, aviso, statusInicial, permitirAlterarStatus = false, onSubmit }: Props) {
  const [v, setV] = useState(valoresIniciais)
  const [plataformas, setPlataformas] = useState<Plataforma[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState<StatusCandidatura | ''>(statusInicial ?? '')

  useEffect(() => {
    let ativo = true
    plataformaService.listar().then(l => { if (ativo) setPlataformas(l) }).catch(() => { /* o formulário funciona sem plataformas */ })
    return () => { ativo = false }
  }, [])

  const visiveis = useMemo(() => plataformas.filter(p => !p.oculta || p.id === valoresIniciais.plataformaId), [plataformas, valoresIniciais.plataformaId])
  const reconhecida = useMemo(() => v.link.trim() ? reconhecerPlataforma(v.link.trim(), plataformas) : null, [v.link, plataformas])
  const plataformaEfetiva = v.plataformaId ?? reconhecida?.id ?? ''
  const usandoReconhecida = v.plataformaId === null && reconhecida !== null

  function atualizar<K extends keyof CandidaturaFormValores>(campo: K, valor: CandidaturaFormValores[K]) {
    setV(atual => ({ ...atual, [campo]: valor }))
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setErro(''); setEnviando(true)
    try {
      await onSubmit({
        titulo: v.titulo.trim(),
        empresa: v.empresa.trim(),
        link: v.link.trim() || null,
        plataformaId: plataformaEfetiva || null,
        dataCandidatura: converterDataParaISO(v.dataCandidatura),
        observacao: v.observacao.trim() || null,
      }, statusSelecionado || undefined)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a candidatura.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className={styles.form} noValidate={false}>
      <div className={ui.field}>
        <label className={ui.label} htmlFor="link">Link da vaga</label>
        <span className={ui.withIcon}>
          <Icon name="link" />
          <input id="link" className={ui.control} type="url" inputMode="url" placeholder="https://..." value={v.link} onChange={e => atualizar('link', e.target.value)} maxLength={2048} aria-describedby="link-dica" />
        </span>
        <div id="link-dica" aria-live="polite">
          {reconhecida
            ? <span className={styles.recognized}><Icon name="verificar" size={14} />Plataforma reconhecida pelo link: {reconhecida.nome}</span>
            : <p className={ui.hint}>Cole o endereço da oportunidade.</p>}
        </div>
      </div>

      <div className={ui.grid2}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="titulo">Título da vaga</label>
          <input id="titulo" className={ui.control} value={v.titulo} onChange={e => atualizar('titulo', e.target.value)} required maxLength={255} />
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="empresa">Empresa</label>
          <input id="empresa" className={ui.control} value={v.empresa} onChange={e => atualizar('empresa', e.target.value)} required maxLength={255} />
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="plataforma">Plataforma</label>
          <select id="plataforma" className={ui.control} value={plataformaEfetiva} onChange={e => atualizar('plataformaId', e.target.value)}>
            <option value="">Não informada</option>
            {visiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          {usandoReconhecida && <p className={ui.hint}>Reconhecida pelo link. Se escolher outra, a sua escolha vale.</p>}
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="data">Data da candidatura</label>
          <span className={ui.withIcon}>
            <Icon name="calendario" />
            <input id="data" className={ui.control} type="text" inputMode="numeric" placeholder="dd/MM/aaaa" value={v.dataCandidatura} onChange={e => atualizar('dataCandidatura', aplicarMascaraData(e.target.value))} maxLength={10} />
          </span>
        </div>
      </div>

      {permitirAlterarStatus && (
        <div className={ui.field}>
          <label className={ui.label} htmlFor="status">Status da candidatura</label>
          <select id="status" className={ui.control} value={statusSelecionado} onChange={e => setStatusSelecionado(e.target.value as StatusCandidatura | '')}>
            <option value="" disabled>Sem status</option>
            {STATUS_TODOS.map(status => <option key={status} value={status}>{STATUS[status].label}</option>)}
          </select>
          <p className={ui.hint}>A alteração será registrada no histórico de status.</p>
        </div>
      )}

      <div className={ui.field}>
        <label className={ui.label} htmlFor="observacao">Observações</label>
        <textarea id="observacao" className={ui.control} placeholder="Anote o que for útil: regime de trabalho, requisitos, quem indicou..." value={v.observacao} onChange={e => atualizar('observacao', e.target.value)} maxLength={5000} rows={5} />
      </div>

      {aviso}
      {erro && <Banner tom="Error" role="alert">{erro}</Banner>}

      <div className={styles.footer}>
        <Link className={ui.secondary} to={cancelarPara}>Cancelar</Link>
        <button className={ui.primary} type="submit" disabled={enviando}>{enviando ? textoSalvando : textoSalvar}</button>
      </div>
    </form>
  )
}
