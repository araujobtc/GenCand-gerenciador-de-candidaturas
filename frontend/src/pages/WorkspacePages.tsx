import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { candidaturaService } from '../api/services/candidaturaService'
import type { CandidaturaResponse, StatusCandidatura } from '../types/candidatura'
import { formatarData } from '../utils/date'
import styles from './WorkspacePages.module.css'

const statusLabel: Record<StatusCandidatura, string> = {
  BANCO_DE_TALENTOS:'Banco de talentos', CANDIDATADA:'Candidatado', ATIVIDADE_PENDENTE:'Atividade pendente',
  ATIVIDADE_REALIZADA:'Atividade realizada', ENTREVISTADA:'Entrevistada', AGUARDANDO_RESULTADO:'Aguardando resultado',
  PASSEI:'Passei', NAO_PASSEI:'Não passei', VAGA_ENCERRADA:'Vaga encerrada', SUMIU:'Sem retorno', DESISTI:'Desisti'
}
const ativos: StatusCandidatura[] = ['BANCO_DE_TALENTOS','CANDIDATADA','ATIVIDADE_PENDENTE','ATIVIDADE_REALIZADA','ENTREVISTADA','AGUARDANDO_RESULTADO']

function useListaCandidaturas() {
  const [items,setItems]=useState<CandidaturaResponse[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{ let alive=true; candidaturaService.listar(0,100).then(r=>{if(alive)setItems(r.content)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Não foi possível carregar os dados.')}).finally(()=>{if(alive)setLoading(false)}); return ()=>{alive=false} },[])
  return {items,loading,error}
}
function PageState({loading,error}:{loading:boolean;error:string}) { return loading?<p className={styles.notice}>Carregando informações…</p>:error?<p className={styles.error} role="alert">{error}</p>:null }

export function DashboardPage() {
 const {items,loading,error}=useListaCandidaturas()
 const counts=useMemo(()=>Object.entries(statusLabel).map(([key,label])=>({key:key as StatusCandidatura,label,total:items.filter(x=>x.status===key).length})),[items])
 const semStatus=items.filter(x=>!x.status).length
 return <MainLayout title="Painel"><div className={styles.pageIntro}><div><p>Acompanhe o andamento da sua busca por oportunidades.</p></div><Link className={styles.primary} to="/candidaturas/nova">＋ Nova candidatura</Link></div><PageState loading={loading} error={error}/>{!loading&&!error&&<><div className={styles.metrics}><article><span>Total de candidaturas</span><strong>{items.length}</strong><small>Oportunidades cadastradas</small></article><article><span>Em andamento</span><strong>{items.filter(x=>x.status&&ativos.includes(x.status)).length}</strong><small>Processos ativos</small></article><article><span>Resultados positivos</span><strong>{items.filter(x=>x.status==='PASSEI').length}</strong><small>Você chegou lá!</small></article><article><span>Sem status</span><strong>{semStatus}</strong><small>Precisam de atualização</small></article></div><section className={styles.panel}><div className={styles.panelHead}><div><h2>Candidaturas por status</h2><p>Distribuição das suas oportunidades</p></div><Link to="/candidaturas">Ver candidaturas →</Link></div><div className={styles.bars}>{counts.filter(x=>x.total>0).map(x=><div className={styles.barRow} key={x.key}><span>{x.label}</span><div><i style={{width:`${Math.max(4,x.total/Math.max(1,items.length)*100)}%`}}/></div><b>{x.total}</b></div>)}{items.length===0&&<p className={styles.notice}>Cadastre sua primeira candidatura para visualizar os indicadores.</p>}</div></section><section className={styles.panel}><div className={styles.panelHead}><div><h2>Atividade recente</h2><p>Últimas oportunidades cadastradas</p></div><Link to="/candidaturas">Ver todas →</Link></div>{items.slice(0,5).map(x=><Link className={styles.recent} key={x.id} to={`/candidaturas/${x.id}`}><span><b>{x.titulo}</b><small>{x.empresa}</small></span><span>{x.status?statusLabel[x.status]:'Sem status'}</span><small>{formatarData(x.dataCandidatura)}</small></Link>)}</section></>}</MainLayout>
}

export function PlataformasPage() {
 const [nome,setNome]=useState(''); const [url,setUrl]=useState('')
 return <MainLayout title="Plataformas"><div className={styles.pageIntro}><p>Organize os sites e plataformas onde você encontra oportunidades.</p><button className={styles.primary} type="button" disabled>＋ Nova plataforma</button></div><div className={styles.panel}><div className={styles.callout}><b>Integração com a API pendente</b><p>A interface está preparada, mas o back-end ainda não disponibiliza operações de consulta e cadastro de plataformas. Nenhuma alteração será salva.</p></div><h2>Adicionar plataforma</h2><div className={styles.formGrid}><label>Nome da plataforma<input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: LinkedIn" disabled/></label><label>Link ou domínio<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." disabled/></label></div><p className={styles.notice}>O cadastro, edição, ocultação e exclusão serão habilitados quando os endpoints estiverem disponíveis.</p></div></MainLayout>
}
export function CurriculosPage() {
 return <MainLayout title="Currículos"><div className={styles.pageIntro}><p>Mantenha seus currículos organizados em um só lugar.</p><button className={styles.primary} disabled>↑ Enviar currículo</button></div><div className={styles.panel}><div className={styles.upload}><div className={styles.uploadIcon}>↑</div><h2>Seus currículos</h2><p>Envie arquivos PDF, defina um currículo principal e mantenha suas versões organizadas.</p><button className={styles.primary} disabled>Selecionar arquivo PDF</button><small>Formato aceito: PDF</small></div><div className={styles.callout}><b>Integração com a API pendente</b><p>O back-end ainda não oferece os endpoints de upload, listagem, download e remoção. Os arquivos não serão enviados nem armazenados nesta etapa.</p></div></div></MainLayout>
}
export function ConfiguracoesPage() {
 return <MainLayout title="Configurações"><div className={styles.pageIntro}><p>Personalize como o GenCand acompanha suas candidaturas.</p></div><section className={styles.panel}><h2>Preferências gerais</h2><div className={styles.setting}><span><b>Período padrão do painel</b><small>Define o intervalo usado nos indicadores.</small></span><select disabled defaultValue="mes"><option value="mes">Este mês</option><option value="semestre">Este semestre</option><option value="ano">Este ano</option></select></div><div className={styles.setting}><span><b>Alertas de candidaturas sem atualização</b><small>Tempo sem movimentação antes de sinalizar uma oportunidade.</small></span><select disabled defaultValue="7"><option value="7">7 dias</option><option value="14">14 dias</option><option value="30">30 dias</option></select></div><div className={styles.setting}><span><b>Receber resumo por e-mail</b><small>Resumo periódico de alertas e entrevistas.</small></span><input type="checkbox" disabled defaultChecked/></div><div className={styles.callout}><b>Configurações ainda não conectadas</b><p>As preferências estão representadas visualmente conforme o protótipo. A API ainda não possui endpoints para consultar ou salvar essas opções.</p></div></section></MainLayout>
}
export function DetalhesCandidaturaPage() {
 const {id}=useParams(); const [item,setItem]=useState<CandidaturaResponse|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{let alive=true;if(id)candidaturaService.buscarPorId(id).then(v=>{if(alive)setItem(v)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Não foi possível carregar a candidatura.')}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[id])
 return <MainLayout title="Detalhes da candidatura"><div className={styles.pageIntro}><Link to="/candidaturas">← Voltar para candidaturas</Link>{item&&<Link className={styles.primary} to={`/candidaturas/${item.id}/editar`}>Editar candidatura</Link>}</div>{loading?<p className={styles.notice}>Carregando…</p>:error?<p role="alert" className={styles.error}>{error}</p>:item&&<><section className={styles.panel}><div className={styles.detailTitle}><div><h2>{item.titulo}</h2><p>{item.empresa}</p></div><span className={styles.pill}>{item.status?statusLabel[item.status]:'Sem status'}</span></div><div className={styles.detailGrid}><div><small>Plataforma</small><b>{item.plataformaNome||'Não informada'}</b></div><div><small>Data da candidatura</small><b>{formatarData(item.dataCandidatura)}</b></div><div><small>Última atualização</small><b>{formatarData(item.dataAtualizacao)}</b></div><div><small>Link da vaga</small>{item.link?<a href={item.link} target="_blank" rel="noreferrer">Abrir oportunidade ↗</a>:<b>Não informado</b>}</div></div><div className={styles.observation}><h3>Observações</h3><p>{item.observacao||'Nenhuma observação registrada.'}</p></div></section><div className={styles.callout}><b>Entrevistas, contatos e histórico</b><p>Essas seções fazem parte do protótipo, mas ainda dependem de endpoints no back-end. Não é possível registrar ou editar esses dados nesta versão.</p></div></>}</MainLayout>
}
