import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Icon, { type IconName } from '../components/ui/Icon'
import { Banner, ErrorState, Loading, Toggle } from '../components/ui/Feedback'
import { plataformaService, preferenciasService, type Plataforma, type Preferencias } from '../api/services/workspaceService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useWorkspace } from '../hooks/useWorkspace'
import { emailDoToken } from '../utils/jwt'
import { periodoAtual, type TipoPeriodo } from '../utils/periodo'
import type { ThemePreference } from '../theme/ThemeContext'
import styles from './ConfiguracoesPage.module.css'
import ui from '../components/ui/ui.module.css'
import { useAutoLimpar } from '../hooks/useAutoLimpar'

const temas: { valor: ThemePreference; label: string; icon: IconName }[] = [
  { valor: 'light', label: 'Claro', icon: 'sol' },
  { valor: 'dark', label: 'Escuro', icon: 'lua' },
  { valor: 'auto', label: 'Automático', icon: 'monitor' },
]
const periodos: { valor: TipoPeriodo; label: string }[] = [{ valor: 'MES', label: 'Mês' }, { valor: 'SEMESTRE', label: 'Semestre' }, { valor: 'ANO', label: 'Ano' }]
const dias: [string, string][] = [['SEGUNDA', 'Segunda-feira'], ['TERCA', 'Terça-feira'], ['QUARTA', 'Quarta-feira'], ['QUINTA', 'Quinta-feira'], ['SEXTA', 'Sexta-feira'], ['SABADO', 'Sábado'], ['DOMINGO', 'Domingo']]

export default function ConfiguracoesPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const { preference, setPreference } = useTheme()
  const { atualizarPreferenciasLocal, recarregarAlertas } = useWorkspace()
  const [prefs, setPrefs] = useState<Preferencias | null>(null)
  const [plataformas, setPlataformas] = useState<Plataforma[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [tentativa, setTentativa] = useState(0)
  useAutoLimpar(erro, setErro)
  useAutoLimpar(sucesso, setSucesso)
  const email = emailDoToken(token)

  useEffect(() => {
    let ativo = true
    Promise.all([preferenciasService.obter(), plataformaService.listar().catch(() => [] as Plataforma[])])
      .then(([p, l]) => { if (ativo) { setPrefs(p); setPlataformas(l) } })
      .catch(e => { if (ativo) setErroCarregamento(e instanceof Error ? e.message : 'Não foi possível carregar as configurações.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [tentativa])

  useEffect(() => {
    if (!carregando && window.location.hash === '#conta') document.getElementById('conta')?.scrollIntoView({ block: 'center' })
  }, [carregando])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!prefs) return
    setSalvando(true); setErro(''); setSucesso('')
    try {
      const salvo = await preferenciasService.atualizar(prefs)
      setPrefs(salvo); atualizarPreferenciasLocal(salvo); recarregarAlertas()
      setSucesso('Configurações salvas.')
    } catch (err) { setErro(err instanceof Error ? err.message : 'Não foi possível salvar.') }
    finally { setSalvando(false) }
  }

  const alterar = (parte: Partial<Preferencias>) => setPrefs(p => (p ? { ...p, ...parte } : p))
  const emailAtivo = prefs ? prefs.freqEmail !== 'DESATIVADA' : false
  const celularAtivo = prefs ? prefs.freqCelular !== 'DESATIVADA' : false

  return (
    <MainLayout title="Configurações" actions={prefs && <button type="submit" form="form-config" className={ui.primary} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar alterações'}</button>}>
      {carregando ? <Loading>Carregando configurações…</Loading> : erroCarregamento && !prefs ? <ErrorState message={erroCarregamento} onRetry={() => { setCarregando(true); setErroCarregamento(''); setTentativa(t => t + 1) }} /> : prefs && (
        <form id="form-config" onSubmit={e => void salvar(e)} className={styles.grid}>
          <div className={styles.col}>
            <section className={ui.card} aria-labelledby="c-apar">
              <h2 id="c-apar" className={ui.cardTitle}>Aparência</h2>
              <p className={ui.cardSub}>A mudança é imediata e fica salva neste navegador.</p>
              <div className={ui.segmented} role="radiogroup" aria-label="Aparência" style={{ marginTop: 14 }}>
                {temas.map(t => (
                  <button key={t.valor} type="button" role="radio" aria-checked={preference === t.valor} className={ui.segmentedItem} onClick={() => setPreference(t.valor)}><Icon name={t.icon} size={16} />{t.label}</button>
                ))}
              </div>
            </section>

            <section className={ui.card} aria-labelledby="c-per">
              <h2 id="c-per" className={ui.cardTitle}>Período padrão</h2>
              <p className={ui.cardSub}>Vale para o Painel e para a lista de candidaturas ao abrir o sistema.</p>
              <div className={ui.segmented} role="radiogroup" aria-label="Período padrão" style={{ marginTop: 14 }}>
                {periodos.map(p => (
                  <button key={p.valor} type="button" role="radio" aria-checked={prefs.periodoPadrao === p.valor} className={ui.segmentedItem} onClick={() => alterar({ periodoPadrao: p.valor })}>{p.label}</button>
                ))}
              </div>
              <p className={ui.hint}>Exibido como: {periodoAtual(prefs.periodoPadrao).rotulo}</p>
            </section>

            <section className={ui.card} aria-labelledby="c-par">
              <h2 id="c-par" className={ui.cardTitle}>Candidatura parada</h2>
              <p className={ui.cardSub}>Quantos dias sem atualização antes de avisar.</p>
              <div className={styles.days}>
                <input className={ui.control} style={{ width: 90 }} type="number" min={1} max={365} value={prefs.diasParaParada} aria-label="Dias sem atualização"
                  onChange={e => alterar({ diasParaParada: Math.min(365, Math.max(1, Number(e.target.value) || 1)) })} />
                <span>dias sem atualização</span>
              </div>
              <p className={ui.hint}>Vale para status em andamento, exceto banco de talentos.</p>
            </section>

            <section className={ui.card} aria-labelledby="c-dom">
              <div className={ui.cardHead}>
                <div><h2 id="c-dom" className={ui.cardTitle}>Domínios reconhecidos</h2><p className={ui.cardSub}>Usados para descobrir a plataforma pelo link da vaga.</p></div>
              </div>
              {plataformas.filter(p => p.dominio).length === 0 ? <p className={ui.hint}>Nenhum domínio cadastrado ainda.</p> : (
                <ul className={styles.domains}>
                  {plataformas.filter(p => p.dominio).map(p => <li key={p.id}><span>{p.dominio}</span><Icon name="chevronRight" size={14} /><b>{p.nome}</b></li>)}
                </ul>
              )}
              <Link to="/plataformas" className={`${ui.secondary} ${styles.manage}`}><Icon name="editar" size={16} />Gerenciar em Plataformas</Link>
            </section>
          </div>

          <div className={styles.col}>
            <section className={ui.card} aria-labelledby="c-av">
              <h2 id="c-av" className={ui.cardTitle}>Avisos</h2>
              <p className={ui.cardSub}>Resumo de candidaturas paradas e sem status.</p>
              <div className={styles.toggleRow}><span>Receber avisos por e-mail</span><Toggle checked={emailAtivo} onChange={v => alterar({ freqEmail: v ? 'SEMANAL' : 'DESATIVADA' })} label="Receber avisos por e-mail" /></div>
              <div className={ui.grid2}>
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="c-freq">Frequência do resumo</label>
                  <select id="c-freq" className={ui.control} disabled={!emailAtivo} value={emailAtivo ? prefs.freqEmail : 'SEMANAL'} onChange={e => alterar({ freqEmail: e.target.value as Preferencias['freqEmail'] })}>
                    <option value="DIARIA">Diária</option><option value="SEMANAL">Semanal</option>
                  </select>
                </div>
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="c-dia">Dia da semana</label>
                  <select id="c-dia" className={ui.control} disabled={!emailAtivo || prefs.freqEmail !== 'SEMANAL'} value={prefs.diaSemanaResumo} onChange={e => alterar({ diaSemanaResumo: e.target.value })}>
                    {dias.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <hr className={styles.sep} />
              <div className={styles.toggleRow}><span>Notificações no celular <span className={`${ui.chip} ${styles.soon}`}>Disponível com o app Android</span></span><Toggle checked={celularAtivo} onChange={v => alterar({ freqCelular: v ? 'DIARIA' : 'DESATIVADA' })} label="Receber notificações no celular" /></div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="c-cel">Frequência</label>
                <select id="c-cel" className={ui.control} disabled={!celularAtivo} value={celularAtivo ? prefs.freqCelular : 'DIARIA'} onChange={e => alterar({ freqCelular: e.target.value as Preferencias['freqCelular'] })}>
                  <option value="DIARIA">Diária</option><option value="SEMANAL">Semanal</option>
                </select>
              </div>
            </section>

            <section className={ui.card} id="conta" aria-labelledby="c-conta">
              <h2 id="c-conta" className={ui.cardTitle}>Conta</h2>
              <div className={ui.field} style={{ marginTop: 14 }}>
                <label className={ui.label} htmlFor="c-email">E-mail</label>
                <input id="c-email" className={ui.control} value={email ?? ''} readOnly disabled />
              </div>
              <div className={styles.accountActions}>
                <Link to="/recuperar-senha" className={ui.secondary} onClick={() => logout()}><Icon name="cadeado" size={16} />Alterar senha</Link>
                <button type="button" className={ui.secondary} onClick={() => { logout(); navigate('/login', { replace: true }) }}><Icon name="sair" size={16} />Sair</button>
              </div>
              <p className={ui.hint}>Para alterar a senha, enviamos um link de uso único (válido por 15 minutos) ao seu e-mail.</p>
            </section>

            {erro && <Banner tom="Error" role="alert">{erro}</Banner>}
            {sucesso && <Banner tom="Success" role="status">{sucesso}</Banner>}
            <div className={styles.saveMobile}><button type="submit" className={`${ui.primary} ${ui.block}`} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar alterações'}</button></div>
          </div>
        </form>
      )}
    </MainLayout>
  )
}
