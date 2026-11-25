import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import { candidaturaService } from '../api/services/candidaturaService'
import { plataformaService, type Plataforma } from '../api/services/workspaceService'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useWorkspace } from '../hooks/useWorkspace'
import type { CandidaturaResponse } from '../types/candidatura'
import styles from './PlataformasPage.module.css'
import ui from '../components/ui/ui.module.css'
import { useAutoLimpar } from '../hooks/useAutoLimpar'

type DestinoCandidaturas = 'apagar' | 'ocultar' | 'manter'

function PlataformaModal({ plataforma, onClose, onSaved }: { plataforma: Plataforma | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(plataforma?.nome ?? '')
  const [dominio, setDominio] = useState(plataforma?.dominio ?? '')
  const [observacao, setObservacao] = useState(plataforma?.observacao ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar(e: FormEvent) {
    e.preventDefault(); setErro(''); setEnviando(true)
    try {
      const dados = { nome: nome.trim(), dominio: dominio.trim() || null, observacao: observacao.trim() || null }
      if (plataforma) await plataformaService.atualizar(plataforma.id, dados); else await plataformaService.criar(dados)
      onSaved()
    } catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível salvar a plataforma.'); setEnviando(false) }
  }

  return (
    <Modal title={plataforma ? 'Editar plataforma' : 'Nova plataforma'} onClose={onClose}
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose}>Cancelar</button>
        <button type="submit" form="form-plataforma" className={ui.primary} disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar plataforma'}</button>
      </>}>
      <form id="form-plataforma" onSubmit={e => void salvar(e)} style={{ display: 'grid', gap: 16 }}>
        <div className={ui.field}><label className={ui.label} htmlFor="p-nome">Nome da plataforma</label><input id="p-nome" className={ui.control} required maxLength={255} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: LinkedIn" /></div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="p-dom">Domínio reconhecido</label>
          <input id="p-dom" className={ui.control} maxLength={255} value={dominio} onChange={e => setDominio(e.target.value)} placeholder="linkedin.com" />
          <p className={ui.hint}>Usado para descobrir a plataforma pelo link da vaga.</p>
        </div>
        <div className={ui.field}><label className={ui.label} htmlFor="p-obs">Como funciona o processo</label><textarea id="p-obs" className={ui.control} rows={3} maxLength={5000} value={observacao} onChange={e => setObservacao(e.target.value)} /></div>
        {erro && <Banner tom="Error" role="alert">{erro}</Banner>}
      </form>
    </Modal>
  )
}

function ApagarModal({ plataforma, ligadas, onClose, onDone }: { plataforma: Plataforma; ligadas: CandidaturaResponse[]; onClose: () => void; onDone: () => void }) {
  const [destino, setDestino] = useState<DestinoCandidaturas>('manter')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const n = ligadas.length

  async function apagar() {
    setEnviando(true); setErro('')
    try {
      if (destino === 'apagar') for (const c of ligadas) await candidaturaService.excluir(c.id)
      if (destino === 'ocultar') for (const c of ligadas) await candidaturaService.ocultar(c.id)
      await plataformaService.excluir(plataforma.id)
      onDone()
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível apagar a plataforma.'); setEnviando(false) }
  }

  const opcoes: { valor: DestinoCandidaturas; titulo: string; texto: string }[] = [
    { valor: 'apagar', titulo: 'Apagar também as candidaturas', texto: `As ${n} candidaturas e o histórico serão removidos.` },
    { valor: 'ocultar', titulo: 'Ocultar as candidaturas', texto: 'Saem da lista e do painel, mas continuam guardadas.' },
    { valor: 'manter', titulo: 'Não alterar as candidaturas', texto: 'Elas continuam na lista, sem plataforma.' },
  ]

  return (
    <Modal title={`Apagar plataforma ${plataforma.nome}?`} subtitle={n > 0 ? `Existem ${n} candidaturas ligadas a ela.` : undefined} onClose={onClose}
      footer={<>
        <button type="button" className={ui.secondary} onClick={onClose} data-autofocus>Cancelar</button>
        <button type="button" className={ui.danger} onClick={() => void apagar()} disabled={enviando}><Icon name="lixeira" />{enviando ? 'Apagando…' : 'Apagar plataforma'}</button>
      </>}>
      {n > 0 ? (
        <fieldset className={styles.options}>
          <legend>O que fazer com elas?</legend>
          {opcoes.map(o => (
            <label key={o.valor} className={`${styles.option} ${destino === o.valor ? styles.optionOn : ''}`}>
              <input type="radio" name="destino" checked={destino === o.valor} onChange={() => setDestino(o.valor)} />
              <span><b>{o.titulo}</b><small>{o.texto}</small></span>
            </label>
          ))}
        </fieldset>
      ) : <p style={{ margin: 0, fontSize: 14 }}>Nenhuma candidatura está ligada a esta plataforma.</p>}
      <p className={styles.irreversible}><Icon name="alerta" size={14} />Apagar a plataforma não pode ser desfeito.</p>
      {erro && <Banner tom="Error" role="alert">{erro}</Banner>}
    </Modal>
  )
}

export default function PlataformasPage() {
  const { recarregarAlertas } = useWorkspace()
  const celular = useMediaQuery('(max-width: 800px)')
  const [itens, setItens] = useState<Plataforma[]>([])
  const [candidaturas, setCandidaturas] = useState<CandidaturaResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [editando, setEditando] = useState<Plataforma | 'nova' | null>(null)
  const [apagando, setApagando] = useState<Plataforma | null>(null)

  useAutoLimpar(aviso, setAviso)
  useAutoLimpar(erroAcao, setErroAcao)

  const carregar = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([plataformaService.listar(), candidaturaService.listarTodas()])
      setItens(p); setCandidaturas(c); setErro('')
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível carregar as plataformas.') }
    finally { setCarregando(false) }
  }, [])
  useEffect(() => { void Promise.resolve().then(carregar) }, [carregar])

  const contagem = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of candidaturas) if (c.plataformaId) m.set(c.plataformaId, (m.get(c.plataformaId) ?? 0) + 1)
    return m
  }, [candidaturas])

  async function ocultar(p: Plataforma) {
    try { await plataformaService.ocultar(p.id); setAviso(`“${p.nome}” foi ocultada dos filtros.`); await carregar() }
    catch (e) { setErroAcao(e instanceof Error ? e.message : 'Não foi possível ocultar.') }
  }

  const novo = <button type="button" className={ui.primary} onClick={() => setEditando('nova')}><Icon name="mais" />Nova plataforma</button>

  const acoes = (p: Plataforma) => (
    <div className={styles.actions}>
      <button type="button" className={ui.iconBtn} onClick={() => setEditando(p)} aria-label={`Editar ${p.nome}`} title="Editar"><Icon name="editar" size={16} /></button>
      <button type="button" className={ui.iconBtn} onClick={() => void ocultar(p)} disabled={p.oculta} aria-label={`Ocultar ${p.nome}`} title={p.oculta ? 'Já está oculta' : 'Ocultar'}><Icon name="ocultar" size={16} /></button>
      <button type="button" className={`${ui.iconBtn} ${ui.iconBtnDanger}`} onClick={() => setApagando(p)} aria-label={`Apagar ${p.nome}`} title="Apagar"><Icon name="lixeira" size={16} /></button>
    </div>
  )
  const estado = (p: Plataforma) => <span className={`${ui.badge} ${p.oculta ? ui.tom_gray : ui.tom_teal}`}>{p.oculta ? <><Icon name="ocultar" size={12} />Oculta</> : <><Icon name="check" size={12} />Ativa</>}</span>

  return (
    <MainLayout title="Plataformas">
      <p className={ui.intro}>Cadastre os sites onde você se candidata. O domínio permite reconhecer a plataforma pelo link da vaga.</p>
      {celular && <div style={{ marginBottom: 16 }}>{<button type="button" className={`${ui.primary} ${ui.block}`} onClick={() => setEditando('nova')}><Icon name="mais" />Nova plataforma</button>}</div>}
      {aviso && <div style={{ marginBottom: 12 }}><Banner tom="Success" role="status">{aviso}</Banner></div>}
      {erroAcao && <div style={{ marginBottom: 12 }}><Banner tom="Error" role="alert">{erroAcao}</Banner></div>}
      {!celular && <div className={styles.toolbar}>{novo}</div>}

      <section className={`${ui.card} ${styles.card}`}>
        {carregando ? <Loading>Carregando plataformas…</Loading>
          : erro ? <ErrorState message={erro} onRetry={() => { setCarregando(true); void carregar() }} />
          : itens.length === 0 ? <EmptyState icon="plataformas" title="Nenhuma plataforma cadastrada" action={novo}>Cadastre Gupy, LinkedIn, Indeed e as outras que você usa.</EmptyState>
          : celular ? (
            <ul className={styles.cards}>
              {itens.map(p => (
                <li key={p.id} className={`${styles.cardItem} ${p.oculta ? styles.dim : ''}`}>
                  <div className={styles.cardTop}><div><b>{p.nome}</b><small>{p.dominio ?? 'Sem domínio'}</small></div>{estado(p)}</div>
                  {p.observacao && <p className={styles.obs}>{p.observacao}</p>}
                  <div className={styles.cardBottom}><span>{contagem.get(p.id) ?? 0} candidaturas</span>{acoes(p)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Plataforma</th><th scope="col">Domínio reconhecido</th><th scope="col">Candidaturas</th><th scope="col">Estado</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
                <tbody>
                  {itens.map(p => (
                    <tr key={p.id} className={p.oculta ? styles.dim : ''}>
                      <td><div className={styles.name}><span className={styles.globe}><Icon name="plataformas" size={16} /></span><div><b>{p.nome}</b>{p.observacao && <small>{p.observacao}</small>}</div></div></td>
                      <td>{p.dominio ?? '—'}</td>
                      <td><b>{contagem.get(p.id) ?? 0}</b></td>
                      <td>{estado(p)}</td>
                      <td>{acoes(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Banner tom="Info"><b>Ao apagar uma plataforma que tem candidaturas, você escolhe o que fazer com elas.</b><br />Apagar, ocultar ou não alterar as candidaturas ligadas. Plataformas ocultas deixam de aparecer nos filtros.</Banner>
      </div>

      {editando && <PlataformaModal plataforma={editando === 'nova' ? null : editando} onClose={() => setEditando(null)} onSaved={() => { setEditando(null); void carregar() }} />}
      {apagando && <ApagarModal plataforma={apagando} ligadas={candidaturas.filter(c => c.plataformaId === apagando.id)} onClose={() => setApagando(null)} onDone={() => { setApagando(null); setAviso('Plataforma apagada.'); recarregarAlertas(); void carregar() }} />}
    </MainLayout>
  )
}
