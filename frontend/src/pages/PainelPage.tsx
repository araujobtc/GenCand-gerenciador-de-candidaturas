import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Icon from '../components/ui/Icon'
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import { STATUS, STATUS_ANDAMENTO, STATUS_FINAIS, type StatusTom } from '../components/ui/status'
import { dashboardService, type Dashboard } from '../api/services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { opcoesPeriodo, periodoAtual } from '../utils/periodo'
import type { StatusCandidatura } from '../types/candidatura'
import styles from './PainelPage.module.css'
import ui from '../components/ui/ui.module.css'

const corDoTom: Record<StatusTom, string> = {
  gray: 'var(--gray)', blue: 'var(--blue)', amber: 'var(--amber)', purple: 'var(--purple)', teal: 'var(--teal)', coral: 'var(--coral)',
}

export default function PainelPage() {
  const { preferencias } = useWorkspace()
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const opcoes = useMemo(() => opcoesPeriodo(), [])
  const padrao = periodoAtual(preferencias?.periodoPadrao ?? 'SEMESTRE')
  const periodo = opcoes.find(o => o.chave === escolhida) ?? opcoes.find(o => o.chave === padrao.chave) ?? padrao

  const [dados, setDados] = useState<Dashboard | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    dashboardService.resumo(periodo.inicio, periodo.fim)
      .then(d => { if (ativo) setDados(d) })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar o painel.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [periodo.inicio, periodo.fim, tentativa])

  const por = dados?.porStatus ?? {}
  const contar = (s: StatusCandidatura) => por[s] ?? 0
  const total = dados?.total ?? 0
  const semStatus = por.SEM_STATUS ?? 0
  const emAndamento = STATUS_ANDAMENTO.reduce((soma, s) => soma + contar(s), 0)
  const entrevistadas = contar('ENTREVISTADA')
  const maximo = Math.max(1, ...[...STATUS_ANDAMENTO, ...STATUS_FINAIS].map(contar))

  function linhas(titulo: string, grupo: 'andamento' | 'final', itens: StatusCandidatura[]) {
    return (
      <section className={styles.group} aria-label={titulo}>
        <h3 className={styles.groupTitle}>
          <i className={grupo === 'final' ? styles.markFilled : styles.markRing} aria-hidden="true" />{titulo}
        </h3>
        <ul className={styles.rows}>
          {itens.map(s => (
            <li key={s} className={styles.row}>
              <span className={styles.rowLabel}>{STATUS[s].label}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={`${styles.fill} ${grupo === 'final' ? styles.fillFinal : ''}`} style={{ width: `${(contar(s) / maximo) * 100}%`, background: corDoTom[STATUS[s].tom] }} />
              </span>
              <b className={styles.rowValue}>{contar(s)}<span className="sr-only"> candidaturas</span></b>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <MainLayout title="Painel">
      <div className={styles.top}>
        <p className={ui.intro} style={{ margin: 0 }}>Acompanhe sua busca em um só lugar.</p>
        <label className={styles.period}>
          <span className="sr-only">Período</span>
          <Icon name="calendario" size={18} />
          <select className={`${ui.control} ${styles.periodSelect}`} value={periodo.chave} onChange={e => { setCarregando(true); setEscolhida(e.target.value) }}>
            {opcoes.map(o => <option key={o.chave} value={o.chave}>{o.rotulo.charAt(0).toUpperCase() + o.rotulo.slice(1)}</option>)}
          </select>
        </label>
      </div>

      {carregando && !dados ? <Loading>Carregando painel…</Loading> : erro ? <ErrorState message={erro} onRetry={() => { setCarregando(true); setErro(''); setTentativa(t => t + 1) }} /> : dados && (
        total === 0 ? (
          <div className={ui.card}>
            <EmptyState icon="candidaturas" title="Nenhuma candidatura neste período"
              action={<Link className={ui.primary} to="/candidaturas/nova"><Icon name="mais" />Nova candidatura</Link>}>
              Cadastre sua primeira candidatura ou escolha outro período para ver os indicadores.
            </EmptyState>
          </div>
        ) : (
          <div className={styles.stack} aria-busy={carregando}>
            <div className={styles.metrics}>
              <article className={`${ui.card} ${styles.metric} ${styles.metricTotal}`}>
                <div><span>Total de candidaturas</span><strong>{total}</strong><small>no período selecionado</small></div>
                <span className={`${styles.tile} ${styles.tileBlue}`}><Icon name="candidaturas" size={20} /></span>
              </article>
              <article className={`${ui.card} ${styles.metric}`}>
                <div><span>Entrevistas realizadas</span><strong>{entrevistadas}</strong><small>candidaturas que chegaram à entrevista</small></div>
                <span className={`${styles.tile} ${styles.tilePurple}`}><Icon name="calendario" size={20} /></span>
              </article>
              <article className={`${ui.card} ${styles.metric}`}>
                <div><span>Em andamento</span><strong>{emAndamento}</strong><small>ainda sem resultado final</small></div>
                <span className={`${styles.tile} ${styles.tileTeal}`}><Icon name="relogio" size={20} /></span>
              </article>
            </div>

            {semStatus > 0 && (
              <Banner tom="Warn" action={<Link className={ui.secondary} to="/candidaturas?semStatus=1">Ver candidaturas</Link>}>
                {semStatus === 1 ? '1 candidatura está sem status.' : `${semStatus} candidaturas estão sem status.`} Marque o status para não perder o acompanhamento.
              </Banner>
            )}

            <section className={ui.card} aria-labelledby="titulo-status">
              <div className={styles.chartHead}>
                <div>
                  <h2 id="titulo-status" className={ui.cardTitle} style={{ fontSize: 18 }}>Candidaturas por status</h2>
                  <p className={ui.cardSub}>Período: {periodo.rotulo}</p>
                </div>
                <div className={styles.legend} aria-hidden="true">
                  <span><i className={styles.markRing} />Em andamento</span>
                  <span><i className={styles.markFilled} />Final</span>
                </div>
              </div>
              {linhas('Em andamento', 'andamento', STATUS_ANDAMENTO)}
              {linhas('Finais', 'final', STATUS_FINAIS)}
            </section>
          </div>
        )
      )}
    </MainLayout>
  )
}
