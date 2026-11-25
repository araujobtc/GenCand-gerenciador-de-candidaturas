import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { candidaturaService } from '../api/services/candidaturaService'
import { useEffect } from 'react'
import { plataformaService, type Plataforma } from '../api/services/workspaceService'
import MainLayout from '../components/layout/MainLayout'
import styles from './ApplicationPages.module.css'
import { aplicarMascaraData, converterDataParaISO } from '../utils/date'

function dataLocalHoje() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${dia}/${mes}/${ano}`
}

function NovaCandidaturaPage() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [link, setLink] = useState('')
  const [dataCandidatura, setDataCandidatura] = useState(dataLocalHoje)
  const [observacao, setObservacao] = useState('')
  const [plataformas, setPlataformas] = useState<Plataforma[]>([])
  const [plataformaId, setPlataformaId] = useState('')
  useEffect(() => { plataformaService.listar().then(setPlataformas).catch(() => setPlataformas([])) }, [])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await candidaturaService.criar({
        titulo,
        empresa,
        link: link || null,
        dataCandidatura: converterDataParaISO(dataCandidatura),
        observacao: observacao || null,
        plataformaId: plataformaId || null,
      })
      navigate('/candidaturas')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a candidatura.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <MainLayout title="Nova candidatura">
      <p className={styles.intro}>Cole o link da vaga e preencha o resto.</p>
      <form onSubmit={enviar}>
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.wide}`}>
            <label htmlFor="link">Link da vaga</label>
            <input id="link" type="url" placeholder="https://..." value={link} onChange={event => setLink(event.target.value)} maxLength={2048} />
            <p className={styles.hint}>Cole o endereço da oportunidade.</p>
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
            <label htmlFor="plataforma">Plataforma</label>
            <select id="plataforma" value={plataformaId} onChange={event => setPlataformaId(event.target.value)}><option value="">Não informada</option>{plataformas.filter(p => !p.oculta).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          </div>
          <div className={styles.formField}>
            <label htmlFor="data">Data da candidatura</label>
            <input id="data" type="text" inputMode="numeric" placeholder="dd/MM/aaaa" value={dataCandidatura} onChange={event => setDataCandidatura(aplicarMascaraData(event.target.value))} maxLength={10} />
          </div>
          <div className={`${styles.formField} ${styles.wide}`}>
            <label htmlFor="observacao">Observações</label>
            <textarea id="observacao" placeholder="Anote o que for útil: regime de trabalho, requisitos, quem indicou..." value={observacao} onChange={event => setObservacao(event.target.value)} maxLength={5000} />
          </div>
        </div>

        {erro && <p role="alert" className={styles.actionMessage}>{erro}</p>}
        <div className={styles.actions}>
          <Link className={styles.secondary} to="/candidaturas">Cancelar</Link>
          <button className={styles.primary} type="submit" disabled={carregando}>{carregando ? 'Salvando...' : 'Salvar candidatura'}</button>
        </div>
      </form>
    </MainLayout>
  )
}

export default NovaCandidaturaPage
