import { useState } from 'react'
import { Link } from 'react-router-dom'
import { candidaturaService } from '../api/services/candidaturaService'
import { useCandidaturas } from '../hooks/useCandidaturas'
import type { StatusCandidatura } from '../types/candidatura'
import { formatarData } from '../utils/date'
import MainLayout from '../components/layout/MainLayout'
import styles from './ApplicationPages.module.css'

const labels: Record<StatusCandidatura, string> = {
  BANCO_DE_TALENTOS: 'Banco de talentos',
  CANDIDATADA: 'Candidatado',
  ATIVIDADE_PENDENTE: 'Atividade pendente',
  ATIVIDADE_REALIZADA: 'Atividade realizada',
  ENTREVISTADA: 'Entrevistada',
  AGUARDANDO_RESULTADO: 'Aguardando resultado',
  PASSEI: 'Passei',
  NAO_PASSEI: 'Não passei',
  VAGA_ENCERRADA: 'Vaga encerrada',
  SUMIU: 'Sem retorno',
  DESISTI: 'Desisti',
}

function CandidaturasPage() {
  const { candidaturas, pagina, numeroPagina, setNumeroPagina, carregando, erro, recarregar, atualizarNaLista } = useCandidaturas()
  const [acaoId, setAcaoId] = useState<string | null>(null)
  const [erroAcao, setErroAcao] = useState('')

  async function alterarStatus(id: string, status: StatusCandidatura) {
    setErroAcao('')
    setAcaoId(id)
    try {
      const candidaturaAtualizada = await candidaturaService.atualizarStatus(id, { status })
      atualizarNaLista(candidaturaAtualizada)
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível atualizar o status.')
    } finally {
      setAcaoId(null)
    }
  }

  async function excluir(id: string, titulo: string) {
    if (!window.confirm(`Deseja realmente excluir a candidatura "${titulo}"?`)) return
    setErroAcao('')
    setAcaoId(id)
    try {
      await candidaturaService.excluir(id)
      if (candidaturas.length === 1 && numeroPagina > 0) setNumeroPagina(numeroPagina - 1)
      else await recarregar()
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível excluir a candidatura.')
    } finally {
      setAcaoId(null)
    }
  }

  return (
    <MainLayout title="Candidaturas">
      <p className={styles.intro}>Organize e acompanhe cada oportunidade.</p>

      <div className={styles.toolbar}>
        <Link className={styles.primary} to="/candidaturas/nova">+ Nova candidatura</Link>
      </div>

      <div className={styles.sectionHead}>
        <div>
          <h2>Suas candidaturas</h2>
          <span className={styles.muted}>{pagina.totalElements} candidaturas</span>
        </div>
      </div>

      {erro && (
        <div role="alert" className={styles.empty}>
          <p>{erro}</p>
          <button className={styles.primary} onClick={() => void recarregar()}>Tentar novamente</button>
        </div>
      )}
      {erroAcao && <p role="alert" className={styles.actionMessage}>{erroAcao}</p>}
      {carregando && <p role="status" className={styles.empty}>Carregando candidaturas...</p>}
      {!carregando && !erro && candidaturas.length === 0 && (
        <div className={styles.empty}>Você ainda não cadastrou candidaturas.</div>
      )}

      {!carregando && !erro && candidaturas.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>VAGA / EMPRESA</th>
                <th>PLATAFORMA</th>
                <th>CANDIDATURA</th>
                <th>ATUALIZAÇÃO</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {candidaturas.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.job}>{item.titulo}</div>
                    <div className={styles.company}>{item.empresa}</div>
                  </td>
                  <td>{item.plataformaNome ?? '—'}</td>
                  <td>{formatarData(item.dataCandidatura)}</td>
                  <td>{formatarData(item.dataAtualizacao)}</td>
                  <td>
                    <label className={styles.visuallyHidden} htmlFor={`status-${item.id}`}>Status de {item.titulo}</label>
                    <select
                      id={`status-${item.id}`}
                      className={styles.inlineSelect}
                      value={item.status ?? ''}
                      disabled={acaoId === item.id}
                      onChange={event => void alterarStatus(item.id, event.target.value as StatusCandidatura)}
                    >
                      <option value="" disabled>Sem status</option>
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {acaoId === item.id && <span className={styles.muted} role="status">Atualizando...</span>}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer">Abrir ↗</a>}
                      <Link to={`/candidaturas/${item.id}/editar`}>Editar</Link>
                      <button
                        className={styles.danger}
                        type="button"
                        disabled={acaoId === item.id}
                        onClick={() => void excluir(item.id, item.titulo)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagina.totalPages > 1 && (
        <div className={styles.actions}>
          <button className={styles.secondary} disabled={numeroPagina <= 0 || carregando} onClick={() => setNumeroPagina(value => value - 1)}>Anterior</button>
          <span className={styles.muted}>Página {numeroPagina + 1} de {pagina.totalPages}</span>
          <button className={styles.secondary} disabled={numeroPagina + 1 >= pagina.totalPages || carregando} onClick={() => setNumeroPagina(value => value + 1)}>Próxima</button>
        </div>
      )}
    </MainLayout>
  )
}

export default CandidaturasPage
