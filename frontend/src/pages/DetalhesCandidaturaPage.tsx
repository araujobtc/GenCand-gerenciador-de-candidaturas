import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Icon from '../components/ui/Icon'
import StatusBadge from '../components/ui/StatusBadge'
import StatusModal from '../components/ui/StatusModal'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import { STATUS } from '../components/ui/status'
import EntrevistaModal from '../components/detalhes/EntrevistaModal'
import ContatoModal from '../components/detalhes/ContatoModal'
import { rotuloTipoEntrevista } from '../components/detalhes/entrevistaConfig'
import { candidaturaService } from '../api/services/candidaturaService'
import { contatoService, entrevistaService, type Contato, type Entrevista } from '../api/services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { formatarData } from '../utils/date'
import { formatarDiaSemanaData, formatarInstante, rotuloLembrete } from '../utils/tempo'
import type { CandidaturaResponse, HistoricoStatusItem } from '../types/candidatura'
import styles from './DetalhesCandidaturaPage.module.css'
import ui from '../components/ui/ui.module.css'
import { useAutoLimpar } from '../hooks/useAutoLimpar'

function linkSeguro(valor: string | null): string | null {
  if (!valor) return null
  try { const u = new URL(valor); return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null } catch { return null }
}
const semProtocolo = (url: string) => url.replace(/^https?:\/\//, '')

export default function DetalhesCandidaturaPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { recarregarAlertas } = useWorkspace()

  const [item, setItem] = useState<CandidaturaResponse | null>(null)
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [contatos, setContatos] = useState<Contato[]>([])
  const [historico, setHistorico] = useState<HistoricoStatusItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [aviso, setAviso] = useState('')
  useAutoLimpar(erro, setErro)
  useAutoLimpar(aviso, setAviso)

  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [entrevistaModal, setEntrevistaModal] = useState<Entrevista | 'nova' | null>(null)
  const [contatoModal, setContatoModal] = useState<Contato | 'novo' | null>(null)
  const [excluirEntrevista, setExcluirEntrevista] = useState<Entrevista | null>(null)
  const [desvincular, setDesvincular] = useState<Contato | null>(null)
  const [verificando, setVerificando] = useState(false)
  // A pergunta "já se candidatou?" vem do estado de navegação e só aparece uma vez.
  const [perguntar, setPerguntar] = useState(() => (location.state as { perguntarCandidatou?: boolean } | null)?.perguntarCandidatou === true)

  useEffect(() => {
    if (perguntar) navigate(location.pathname, { replace: true, state: null })
  }, [perguntar, navigate, location.pathname])

  const carregar = useCallback(async () => {
    if (!id) return
    try {
      const [c, e, co, h] = await Promise.all([
        candidaturaService.buscarPorId(id), entrevistaService.listar(id), contatoService.listar(id),
        candidaturaService.historico(id).catch(() => [] as HistoricoStatusItem[]),
      ])
      setItem(c); setEntrevistas(e); setContatos(co); setHistorico(h); setErroCarregamento('')
    } catch (e) {
      setErroCarregamento(e instanceof Error ? e.message : 'Não foi possível carregar a candidatura.')
    } finally { setCarregando(false) }
  }, [id])

  useEffect(() => { void Promise.resolve().then(carregar) }, [carregar])

  async function recarregarTudo(mensagem?: string) {
    await carregar(); recarregarAlertas()
    if (mensagem) setAviso(mensagem)
  }

  async function verificarHoje() {
    if (!id) return
    setVerificando(true)
    try { setItem(await candidaturaService.verificarHoje(id)); recarregarAlertas(); setAviso('Verificação registrada para hoje.') }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível registrar a verificação.') }
    finally { setVerificando(false) }
  }

  async function confirmouCandidatura() {
    if (!id) return
    await candidaturaService.atualizarStatus(id, { status: 'CANDIDATADA' })
    setPerguntar(false)
    await recarregarTudo('Status marcado como Candidatada.')
  }

  const botoes = item && (
    <>
      <button type="button" className={ui.secondary} onClick={() => void verificarHoje()} disabled={verificando}><Icon name="verificar" />Verifiquei hoje</button>
      <button type="button" className={ui.primary} onClick={() => setAlterandoStatus(true)}><Icon name="editar" />Alterar status</button>
    </>
  )
  const link = linkSeguro(item?.link ?? null)
  const desde = historico[0]?.alteradoEm

  return (
    <MainLayout title="Detalhes da candidatura" backTo="/candidaturas" actions={botoes}>
      {carregando ? <Loading>Carregando candidatura…</Loading>
        : erroCarregamento && !item ? <ErrorState message={erroCarregamento} onRetry={() => { setCarregando(true); setErroCarregamento(''); void carregar() }} />
        : item && (
          <div className={styles.page}>
            <nav className={styles.crumbs} aria-label="Você está em"><Link to="/candidaturas">Candidaturas</Link><span aria-hidden="true">/</span><span>{item.titulo}</span></nav>
            {aviso && <Banner tom="Success" role="status">{aviso}</Banner>}
            {erro && <Banner tom="Error" role="alert">{erro}</Banner>}

            <section className={`${ui.card} ${styles.hero}`}>
              <span className={styles.heroIcon}><Icon name="candidaturas" size={26} /></span>
              <div className={styles.heroText}>
                <h2>{item.titulo}</h2>
                <p>{item.empresa}{item.plataformaNome ? ` · ${item.plataformaNome}` : ''}</p>
                <StatusBadge status={item.status} />
              </div>
              <div className={styles.heroDates}>
                <span>Última verificação: {formatarInstante(item.dataAtualizacao)}</span>
                <span>Candidatura em {formatarData(item.dataCandidatura)}</span>
              </div>
            </section>

            <div className={styles.mobileActions}>{botoes}</div>

            <div className={styles.columns}>
              <div className={styles.main}>
                <section className={ui.card} aria-labelledby="t-info">
                  <h2 id="t-info" className={ui.cardTitle}>Informações da vaga</h2>
                  <dl className={styles.info}>
                    <div><dt><Icon name="link" size={15} />Link</dt><dd>{link ? <a href={link} target="_blank" rel="noopener noreferrer">{semProtocolo(link)}</a> : 'Não informado'}</dd></div>
                    <div><dt><Icon name="plataformas" size={15} />Plataforma</dt><dd>{item.plataformaNome ?? 'Não informada'}</dd></div>
                    <div><dt><Icon name="calendario" size={15} />Data da candidatura</dt><dd>{formatarData(item.dataCandidatura)}</dd></div>
                    <div><dt><Icon name="verificar" size={15} />Última verificação</dt><dd>{formatarInstante(item.dataAtualizacao)}</dd></div>
                  </dl>
                  <div className={styles.obs}><span>Observações</span><p>{item.observacao || 'Sem observações.'}</p></div>
                  <Link to={`/candidaturas/${item.id}/editar`} className={`${ui.secondary} ${styles.editLink}`}><Icon name="editar" />Editar candidatura</Link>
                </section>

                <section className={ui.card} aria-labelledby="t-ent">
                  <div className={ui.cardHead}>
                    <h2 id="t-ent" className={ui.cardTitle}>Entrevistas</h2>
                    <button type="button" className={ui.secondary} onClick={() => setEntrevistaModal('nova')}><Icon name="mais" />Adicionar<span className={styles.hideMobile}>entrevista</span></button>
                  </div>
                  {entrevistas.length === 0 ? (
                    <EmptyState icon="calendario" title="Nenhuma entrevista ainda">Ao registrar, o status vira Entrevistada.</EmptyState>
                  ) : (
                    <ul className={styles.list}>
                      {entrevistas.map(x => {
                        const url = linkSeguro(x.linkChamada)
                        return (
                          <li key={x.id} className={styles.entry}>
                            <div className={styles.entryTop}>
                              <span className={`${ui.badge} ${ui.tom_purple}`}>{rotuloTipoEntrevista(x.tipo)}</span>
                              <span className={styles.entryActions}>
                                <button type="button" className={ui.iconBtn} onClick={() => setEntrevistaModal(x)} aria-label={`Editar entrevista ${rotuloTipoEntrevista(x.tipo)}`}><Icon name="editar" size={16} /></button>
                                <button type="button" className={`${ui.iconBtn} ${ui.iconBtnDanger}`} onClick={() => setExcluirEntrevista(x)} aria-label={`Excluir entrevista ${rotuloTipoEntrevista(x.tipo)}`}><Icon name="lixeira" size={16} /></button>
                              </span>
                            </div>
                            <div className={styles.entryGrid}>
                              <span className={styles.line}><Icon name="relogio" size={15} />{formatarDiaSemanaData(x.dataHora)}</span>
                              <span className={styles.line}><Icon name="video" size={15} />{x.plataformaChamada ?? 'Plataforma não informada'}</span>
                              {x.linkChamada && <span className={`${styles.line} ${styles.lineFull}`}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{semProtocolo(url)}</a> : x.linkChamada}</span>}
                            </div>
                            {x.lembretesMinutosAntes.length > 0 && (
                              <div className={styles.chips}>{[...x.lembretesMinutosAntes].sort((a, b) => b - a).map(m => <span key={m} className={ui.chip}>Lembrete: {rotuloLembrete(m)}</span>)}</div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>

                <section className={ui.card} aria-labelledby="t-con">
                  <div className={ui.cardHead}>
                    <h2 id="t-con" className={ui.cardTitle}>Contatos</h2>
                    <button type="button" className={ui.secondary} onClick={() => setContatoModal('novo')}><Icon name="mais" />Adicionar<span className={styles.hideMobile}>contato</span></button>
                  </div>
                  {contatos.length === 0 ? (
                    <EmptyState icon="usuario" title="Nenhum contato ainda">Registre a recrutadora ou o gestor para saber com quem falou.</EmptyState>
                  ) : (
                    <ul className={styles.list}>
                      {contatos.map(c => {
                        const inUrl = linkSeguro(c.linkedin)
                        return (
                          <li key={c.id} className={styles.entry}>
                            <div className={styles.entryTop}>
                              <div className={styles.person}>
                                <span className={styles.avatar} aria-hidden="true">{c.nome.charAt(0).toUpperCase()}</span>
                                <div><b>{c.nome}</b><small>{c.cargo ?? 'Cargo não informado'}</small></div>
                              </div>
                              <span className={styles.entryActions}>
                                <button type="button" className={ui.iconBtn} onClick={() => setContatoModal(c)} aria-label={`Editar observação de ${c.nome}`}><Icon name="editar" size={16} /></button>
                                <button type="button" className={`${ui.iconBtn} ${ui.iconBtnDanger}`} onClick={() => setDesvincular(c)} aria-label={`Desvincular ${c.nome}`}><Icon name="lixeira" size={16} /></button>
                              </span>
                            </div>
                            <div className={styles.entryGrid}>
                              {c.email && <span className={styles.line}><Icon name="email" size={15} /><a href={`mailto:${c.email}`}>{c.email}</a></span>}
                              {c.telefone && <span className={styles.line}><Icon name="telefone" size={15} />{c.telefone}</span>}
                              {inUrl && <span className={styles.line}><Icon name="link" size={15} /><a href={inUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>}
                            </div>
                            {c.observacao && <p className={styles.note}>{c.observacao}</p>}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              </div>

              <aside className={styles.side}>
                <section className={ui.card} aria-labelledby="t-atual">
                  <h2 id="t-atual" className={ui.cardTitle}>Status atual</h2>
                  <div style={{ marginTop: 12 }}><StatusBadge status={item.status} /></div>
                  {desde && <p className={ui.cardSub} style={{ marginTop: 10 }}>Desde {formatarInstante(desde)}</p>}
                </section>
                <section className={ui.card} aria-labelledby="t-hist">
                  <h2 id="t-hist" className={ui.cardTitle}>Histórico de status</h2>
                  {historico.length === 0 ? <p className={ui.cardSub} style={{ marginTop: 10 }}>Nenhuma mudança de status registrada.</p> : (
                    <ol className={styles.timeline}>
                      {historico.map((h, i) => (
                        <li key={`${h.alteradoEm}-${i}`} className={i === 0 ? styles.current : ''}>
                          <b>{STATUS[h.statusNovo]?.label ?? h.statusNovo}</b>
                          <small>{formatarInstante(h.alteradoEm)}{h.statusAnterior === null ? ' · Primeiro status' : ''}</small>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </aside>
            </div>
          </div>
        )}

      {item && alterandoStatus && <StatusModal candidatura={item} onClose={() => setAlterandoStatus(false)} onSaved={() => { setAlterandoStatus(false); void recarregarTudo('Status atualizado.') }} />}
      {item && entrevistaModal && <EntrevistaModal candidaturaId={item.id} titulo={`${item.titulo} · ${item.empresa}`} entrevista={entrevistaModal === 'nova' ? null : entrevistaModal} onClose={() => setEntrevistaModal(null)} onSaved={() => { setEntrevistaModal(null); void recarregarTudo('Entrevista salva.') }} />}
      {item && contatoModal && <ContatoModal candidaturaId={item.id} titulo={`${item.titulo} · ${item.empresa}`} contato={contatoModal === 'novo' ? null : contatoModal} onClose={() => setContatoModal(null)} onSaved={() => { setContatoModal(null); void recarregarTudo('Contato salvo.') }} />}
      {item && excluirEntrevista && (
        <ConfirmDialog title="Excluir entrevista?" confirmLabel="Excluir" onClose={() => setExcluirEntrevista(null)}
          onConfirm={async () => { await entrevistaService.excluir(item.id, excluirEntrevista.id); setExcluirEntrevista(null); await recarregarTudo('Entrevista excluída.') }}>
          A entrevista e os lembretes dela serão removidos.
        </ConfirmDialog>
      )}
      {item && desvincular && (
        <ConfirmDialog title="Desvincular contato?" subtitle={desvincular.nome} confirmLabel="Desvincular" onClose={() => setDesvincular(null)}
          onConfirm={async () => { await contatoService.desvincular(item.id, desvincular.id); setDesvincular(null); await recarregarTudo('Contato desvinculado.') }}>
          O contato deixa de aparecer nesta candidatura.
        </ConfirmDialog>
      )}
      {item && perguntar && (
        <Modal title="Você já se candidatou a esta vaga?" onClose={() => setPerguntar(false)}
          footer={<>
            <button type="button" className={ui.secondary} onClick={() => setPerguntar(false)}>Ainda não</button>
            <button type="button" className={ui.primary} data-autofocus onClick={() => void confirmouCandidatura().catch(e => { setErro(e instanceof Error ? e.message : 'Não foi possível atualizar o status.'); setPerguntar(false) })}><Icon name="check" />Sim, já me candidatei</button>
          </>}>
          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{item.titulo} · {item.empresa}</p>
          <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 14 }}>A candidatura foi salva sem status. Se você já se candidatou, podemos marcar agora como Candidatada.</p>
          <Banner tom="Info">Este aviso aparece só agora. Depois você muda o status na candidatura.</Banner>
        </Modal>
      )}
    </MainLayout>
  )
}
