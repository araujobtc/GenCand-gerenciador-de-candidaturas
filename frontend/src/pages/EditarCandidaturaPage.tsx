import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { candidaturaService } from '../api/services/candidaturaService'
import MainLayout from '../components/layout/MainLayout'
import styles from './ApplicationPages.module.css'
import { aplicarMascaraData, converterDataParaISO, formatarData } from '../utils/date'

function EditarCandidaturaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [link, setLink] = useState('')
  const [dataCandidatura, setDataCandidatura] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      if (!id) {
        setErro('Identificador da candidatura não informado.')
        setCarregando(false)
        return
      }

      try {
        const candidatura = await candidaturaService.buscarPorId(id)
        if (!ativo) return
        setTitulo(candidatura.titulo)
        setEmpresa(candidatura.empresa)
        setLink(candidatura.link ?? '')
        setDataCandidatura(candidatura.dataCandidatura ? formatarData(candidatura.dataCandidatura) : '')
        setObservacao(candidatura.observacao ?? '')
      } catch (error) {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar a candidatura.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregar()
    return () => { ativo = false }
  }, [id])

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return
    setErro('')
    setSalvando(true)
    try {
      await candidaturaService.atualizar(id, {
        titulo,
        empresa,
        link: link || null,
        dataCandidatura: converterDataParaISO(dataCandidatura),
        observacao: observacao || null,
      })
      navigate('/candidaturas')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar a candidatura.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <MainLayout title="Editar candidatura">
      <p className={styles.intro}>Atualize as informações desta oportunidade.</p>
      {carregando ? (
        <p className={styles.empty} role="status">Carregando candidatura...</p>
      ) : erro ? (
        <p role="alert" className={styles.actionMessage}>{erro}</p>
      ) : (
        <form onSubmit={enviar}>
          <div className={styles.formGrid}>
            <div className={`${styles.formField} ${styles.wide}`}>
              <label htmlFor="link">Link da vaga</label>
              <input id="link" type="url" placeholder="https://..." value={link} onChange={event => setLink(event.target.value)} maxLength={2048} />
            </div>
            <div className={styles.formField}>
              <label htmlFor="titulo">Título da vaga</label>
              <input id="titulo" value={titulo} onChange={event => setTitulo(event.target.value)} required maxLength={255} />
            </div>
            <div className={styles.formField}>
              <label htmlFor="empresa">Empresa</label>
              <input id="empresa" value={empresa} onChange={event => setEmpresa(event.target.value)} required maxLength={255} />
            </div>
            <div className={styles.formField}>
              <label htmlFor="data">Data da candidatura</label>
              <input id="data" type="text" inputMode="numeric" placeholder="dd/MM/aaaa" value={dataCandidatura} onChange={event => setDataCandidatura(aplicarMascaraData(event.target.value))} maxLength={10} />
            </div>
            <div className={`${styles.formField} ${styles.wide}`}>
              <label htmlFor="observacao">Observações</label>
              <textarea id="observacao" value={observacao} onChange={event => setObservacao(event.target.value)} maxLength={5000} />
            </div>
          </div>
          <p className={styles.hint}>A plataforma não pode ser alterada nesta versão.</p>
          {erro && <p role="alert" className={styles.actionMessage}>{erro}</p>}
          <div className={styles.actions}>
            <Link className={styles.secondary} to="/candidaturas">Cancelar</Link>
            <button className={styles.primary} type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      )}
    </MainLayout>
  )
}

export default EditarCandidaturaPage
