import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import StatusModal from '../components/ui/StatusModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import RowMenu, { type RowMenuItem } from '../components/ui/RowMenu'
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import { STATUS_TODOS, STATUS, contaParaParada } from '../components/ui/status'
import { candidaturaService } from '../api/services/candidaturaService'
import { plataformaService, type Plataforma } from '../api/services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { estaNoPeriodo, opcoesPeriodo, periodoAtual, rotuloCurto } from '../utils/periodo'
import { diasDesde, rotuloRelativo } from '../utils/tempo'
import { formatarData } from '../utils/date'
import type { CandidaturaResponse, StatusCandidatura } from '../types/candidatura'
import styles from './CandidaturasPage.module.css'
import ui from '../components/ui/ui.module.css'
import { useAutoLimpar } from '../hooks/useAutoLimpar'

const POR_PAGINA = 10
const TODOS_PERIODOS = 'todos'
type Filtros = { busca: string; status: string; plataforma: string; periodo: string | null }
const FILTROS_VAZIOS: Filtros = { busca: '', status: '', plataforma: '', periodo: null }

function linkSeguro(valor: string | null): string | null {
  if (!valor) return null
  try { const u = new URL(valor); return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null } catch { return null }
}
const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export default function CandidaturasPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { preferencias, recarregarAlertas } = useWorkspace()
  const celular = useMediaQuery('(max-width: 800px)')

  const [itens, setItens] = useState<CandidaturaResponse[]>([])
  const [plataformas, setPlataformas] = useState<Plataforma[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  const inicial: Filtros = { ...FILTROS_VAZIOS, status: params.get('semStatus') === '1' ? 'SEM_STATUS' : '' }
  const [rascunho, setRascunho] = useState<Filtros>(inicial)
  const [aplicados, setAplicados] = useState<Filtros>(inicial)
  const [pagina, setPagina] = useState(0)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const [aviso, setAviso] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [emStatus, setEmStatus] = useState<CandidaturaResponse | null>(null)
  const [emExclusao, setEmExclusao] = useState<CandidaturaResponse | null>(null)
  const [verificando, setVerificando] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    Promise.all([candidaturaService.listarTodas(), plataformaService.listar().catch(() => [] as Plataforma[])])
      .then(([lista, plats]) => { if (ativo) { setItens(lista); setPlataformas(plats) } })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar as candidaturas.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [tentativa])

  useAutoLimpar(aviso, setAviso)
  useAutoLimpar(erroAcao, setErroAcao)

  const opcoes = useMemo(() => opcoesPeriodo(), [])
  const padrao = periodoAtual(preferencias?.periodoPadrao ?? 'SEMESTRE')
  const chavePeriodo = aplicados.periodo ?? padrao.chave
  const chaveSelect = rascunho.periodo ?? padrao.chave
  const periodo = chavePeriodo === TODOS_PERIODOS ? null : (opcoes.find(o => o.chave === chavePeriodo) ?? padrao)
  const diasParada = preferencias?.diasParaParada ?? 7

  const filtradas = useMemo(() => {
    const termo = aplicados.busca.trim().toLowerCase()
    return itens.filter(c => {
      if (periodo && !estaNoPeriodo(c.dataCandidatura, periodo)) return false
      if (aplicados.status === 'SEM_STATUS' ? c.status !== null : aplicados.status && c.status !== aplicados.status) return false
      if (aplicados.plataforma && c.plataformaId !== aplicados.plataforma) return false
      if (termo && !`${c.titulo} ${c.empresa}`.toLowerCase().includes(termo)) return false
      return true
    })
  }, [itens, periodo, aplicados])

  const semStatusNoPeriodo = useMemo(
    () => itens.filter(c => c.status === null && (!periodo || estaNoPeriodo(c.dataCandidatura, periodo))).length,
    [itens, periodo],
  )

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas - 1)
  const visiveis = filtradas.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA)
  const temFiltro = Boolean(aplicados.busca || aplicados.status || aplicados.plataforma)

  const substituir = useCallback((nova: CandidaturaResponse) => {
    setItens(lista => lista.map(c => c.id === nova.id ? nova : c))
    recarregarAlertas()
  }, [recarregarAlertas])

  function pesquisar() { setAplicados(rascunho); setPagina(0) }

  function limparFiltros() {
    setRascunho(FILTROS_VAZIOS); setAplicados(FILTROS_VAZIOS); setPagina(0)
  }

  async function verificarHoje(c: CandidaturaResponse) {
    setVerificando(c.id); setErroAcao('')
    try { substituir(await candidaturaService.verificarHoje(c.id)); setAviso(`Verificação de “${c.titulo}” registrada para hoje.`) }
    catch (e) { setErroAcao(e instanceof Error ? e.message : 'Não foi possível registrar a verificação.') }
    finally { setVerificando(null) }
  }

  async function excluir(c: CandidaturaResponse) {
    await candidaturaService.excluir(c.id)
    setItens(lista => lista.filter(x => x.id !== c.id))
    setEmExclusao(null)
    recarregarAlertas()
    setAviso('Candidatura excluída.')
  }

  function menuDe(c: CandidaturaResponse): RowMenuItem[] {
    const link = linkSeguro(c.link)
    return [
      { label: 'Ver detalhes', icon: 'candidaturas', onSelect: () => navigate(`/candidaturas/${c.id}`) },
      { label: 'Editar', icon: 'editar', onSelect: () => navigate(`/candidaturas/${c.id}/editar`) },
      { label: 'Alterar status', icon: 'verificar', onSelect: () => setEmStatus(c) },
      ...(link ? [{ label: 'Abrir vaga', icon: 'externo' as const, href: link, external: true }] : []),
      { label: 'Excluir', icon: 'lixeira', danger: true, onSelect: () => setEmExclusao(c) },
    ]
  }

  function atualizacao(c: CandidaturaResponse) {
    const dias = diasDesde(c.dataAtualizacao)
    const parada = contaParaParada(c.status) && dias !== null && dias >= diasParada
    return (
      <div className={styles.update}>
        <span>{rotuloRelativo(dias)}</span>
        {parada && <small className={styles.warn}><Icon name="alerta" size={12} />Parada há {dias} dias</small>}
        {c.status === null && <small className={styles.warn}><Icon name="alerta" size={12} />Defina o status</small>}
      </div>
    )
  }

  function acoes(c: CandidaturaResponse) {
    return (
      <div className={styles.actions}>
        <button type="button" className={`${ui.iconBtn} ${ui.iconBtnTeal}`} onClick={() => void verificarHoje(c)} disabled={verificando === c.id}
          aria-label={`Verifiquei hoje: ${c.titulo}`} title="Verifiquei hoje"><Icon name="verificar" /></button>
        <RowMenu items={menuDe(c)} label={`Mais ações para ${c.titulo}`} />
      </div>
    )
  }

  const filtrosCampos = (
    <>
      <label className={ui.field}>
        <span className={ui.label}>Status</span>
        <select className={ui.control} value={rascunho.status} onChange={e => setRascunho(r => ({ ...r, status: e.target.value }))}>
          <option value="">Todos os status</option>
          <option value="SEM_STATUS">Sem status</option>
          {STATUS_TODOS.map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
        </select>
      </label>
      <label className={ui.field}>
        <span className={ui.label}>Plataforma</span>
        <select className={ui.control} value={rascunho.plataforma} onChange={e => setRascunho(r => ({ ...r, plataforma: e.target.value }))}>
          <option value="">Todas</option>
          {plataformas.filter(p => !p.oculta).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </label>
      <label className={ui.field}>
        <span className={ui.label}>Período</span>
        <select className={ui.control} value={chaveSelect} onChange={e => setRascunho(r => ({ ...r, periodo: e.target.value }))}>
          {opcoes.map(o => <option key={o.chave} value={o.chave}>{capitalizar(o.rotulo)}</option>)}
          <option value={TODOS_PERIODOS}>Todo o período</option>
        </select>
      </label>
    </>
  )

  const buscaCampo = (
    <label className={`${ui.field} ${styles.search}`}>
      <span className={celular ? 'sr-only' : ui.label}>Buscar</span>
      <span className={ui.withIcon}>
        <Icon name="busca" />
        <input className={ui.control} type="search" placeholder="Vaga ou empresa" value={rascunho.busca} onChange={e => setRascunho(r => ({ ...r, busca: e.target.value }))} />
      </span>
    </label>
  )

  return (
    <MainLayout title="Candidaturas">
      <p className={`${ui.intro} ${styles.desktopOnly}`}>Organize e acompanhe cada oportunidade.</p>

      {celular ? (
        <form role="search" className={styles.mobileBar} onSubmit={e => { e.preventDefault(); pesquisar() }}>
          {buscaCampo}
          <button type="submit" className={`${ui.iconBtn} ${styles.filterBtn}`} aria-label="Pesquisar" title="Pesquisar"><Icon name="busca" /></button>
          <button type="button" className={`${ui.iconBtn} ${styles.filterBtn}`} onClick={() => setFiltrosAbertos(true)} aria-label="Abrir filtros">
            <Icon name="filtro" />{temFiltro && <span className={styles.filterDot} aria-hidden="true" />}
          </button>
        </form>
      ) : (
        <form role="search" className={`${ui.card} ${styles.filters}`} aria-label="Filtros" onSubmit={e => { e.preventDefault(); pesquisar() }}>
          {buscaCampo}
          {filtrosCampos}
          <button type="submit" className={`${ui.primary} ${styles.lupaBtn}`} aria-label="Pesquisar" title="Pesquisar"><Icon name="busca" /></button>
        </form>
      )}

      {celular && periodo && <p className={styles.chips}><span className={ui.chip}>{rotuloCurto(periodo)}</span>{aplicados.status && <span className={ui.chip}>{aplicados.status === 'SEM_STATUS' ? 'Sem status' : STATUS[aplicados.status as StatusCandidatura].label}</span>}</p>}

      <div aria-live="polite">{aviso && <div className={styles.notice}><Banner tom="Success" role="status">{aviso}</Banner></div>}</div>
      {erroAcao && <div className={styles.notice}><Banner tom="Error" role="alert">{erroAcao}</Banner></div>}

      <section className={`${ui.card} ${styles.listCard}`} aria-labelledby="titulo-lista">
        <div className={styles.listHead}>
          <div>
            <h2 id="titulo-lista" className={ui.cardTitle} style={{ fontSize: 18 }}>Suas candidaturas</h2>
            <p className={ui.cardSub}>{filtradas.length} {periodo ? 'no período selecionado' : 'no total'}</p>
          </div>
          <div className={styles.headActions}>
            {semStatusNoPeriodo > 0 && (
              <button type="button" className={`${ui.badge} ${ui.badgeNone} ${styles.semStatusPill}`} onClick={() => { setRascunho(r => ({ ...r, status: 'SEM_STATUS' })); setAplicados(a => ({ ...a, status: 'SEM_STATUS' })); setPagina(0) }}>
                Sem status: {semStatusNoPeriodo}
              </button>
            )}
            {!celular && <Link className={ui.primary} to="/candidaturas/nova"><Icon name="mais" />Nova candidatura</Link>}
          </div>
        </div>

        {carregando ? <Loading>Carregando candidaturas…</Loading>
          : erro ? <ErrorState message={erro} onRetry={() => { setCarregando(true); setErro(''); setTentativa(t => t + 1) }} />
          : itens.length === 0 ? (
            <EmptyState icon="candidaturas" title="Você ainda não cadastrou candidaturas"
              action={<Link className={ui.primary} to="/candidaturas/nova"><Icon name="mais" />Nova candidatura</Link>}>
              Cadastre a primeira para começar a acompanhar suas vagas.
            </EmptyState>
          ) : filtradas.length === 0 ? (
            <EmptyState icon="busca" title="Nenhuma candidatura encontrada"
              action={<button type="button" className={ui.secondary} onClick={limparFiltros}>Limpar filtros</button>}>
              Ajuste a busca ou os filtros para ver outras candidaturas.
            </EmptyState>
          ) : celular ? (
            <ul className={styles.cards}>
              {visiveis.map(c => (
                <li key={c.id} className={styles.cardItem}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardTitleBox}>
                      <Link to={`/candidaturas/${c.id}`} className={styles.job}>{c.titulo}</Link>
                      <span className={styles.company}>{c.empresa}</span>
                    </div>
                    {acoes(c)}
                  </div>
                  <StatusBadge status={c.status} />
                  <div className={styles.cardMeta}>
                    <span>{c.plataformaNome ?? 'Sem plataforma'} · {formatarData(c.dataCandidatura)}</span>
                    {atualizacao(c)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Vaga / empresa</th><th scope="col">Plataforma</th><th scope="col">Candidatura</th><th scope="col">Atualização</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
                <tbody>
                  {visiveis.map(c => (
                    <tr key={c.id}>
                      <td><Link to={`/candidaturas/${c.id}`} className={styles.job}>{c.titulo}</Link><span className={styles.company}>{c.empresa}</span></td>
                      <td>{c.plataformaNome ?? '—'}</td>
                      <td>{formatarData(c.dataCandidatura)}</td>
                      <td>{atualizacao(c)}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>{acoes(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {!carregando && !erro && filtradas.length > 0 && (
          <div className={styles.pager}>
            <span className={styles.pagerInfo}>Mostrando {visiveis.length} de {filtradas.length}</span>
            <span className={styles.pagerPage}>Página {paginaAtual + 1} de {totalPaginas}</span>
            <div className={styles.pagerBtns}>
              <button type="button" className={ui.secondary} disabled={paginaAtual === 0} onClick={() => setPagina(paginaAtual - 1)}>Anterior</button>
              <button type="button" className={ui.secondary} disabled={paginaAtual + 1 >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>Próxima</button>
            </div>
          </div>
        )}
      </section>

      {celular && <Link to="/candidaturas/nova" className={styles.fab}><Icon name="mais" size={20} />Nova candidatura</Link>}

      {filtrosAbertos && (
        <Modal title="Filtros" onClose={() => setFiltrosAbertos(false)}
          footer={<>
            <button type="button" className={ui.secondary} onClick={() => { limparFiltros(); setFiltrosAbertos(false) }}>Limpar</button>
            <button type="button" className={ui.primary} onClick={() => { pesquisar(); setFiltrosAbertos(false) }}>Aplicar filtros</button>
          </>}>
          <div className={styles.sheet}>
            {filtrosCampos}
          </div>
        </Modal>
      )}
      {emStatus && <StatusModal candidatura={emStatus} onClose={() => setEmStatus(null)} onSaved={nova => { substituir(nova); setEmStatus(null); setAviso('Status atualizado.') }} />}
      {emExclusao && (
        <ConfirmDialog title="Excluir candidatura?" subtitle={`${emExclusao.titulo} · ${emExclusao.empresa}`} confirmLabel="Excluir candidatura"
          onClose={() => setEmExclusao(null)} onConfirm={() => excluir(emExclusao)}>
          A candidatura e o histórico dela serão removidos e essa ação não pode ser desfeita.
        </ConfirmDialog>
      )}
    </MainLayout>
  )
}
