import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import CandidaturaForm from '../components/candidatura/CandidaturaForm'
import { Banner } from '../components/ui/Feedback'
import { candidaturaService } from '../api/services/candidaturaService'
import { useWorkspace } from '../hooks/useWorkspace'
import styles from './NovaCandidaturaPage.module.css'
import ui from '../components/ui/ui.module.css'

function dataLocalHoje() {
  const [ano, mes, dia] = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).split('-')
  return `${dia}/${mes}/${ano}`
}

const passos = [
  { titulo: 'Cole o link', texto: 'Se o site for conhecido, a plataforma é preenchida sozinha.' },
  { titulo: 'Salve', texto: 'A candidatura nasce sem status e com a data de hoje.' },
  { titulo: 'Confirme', texto: 'Responda se já se candidatou. Você também pode deixar para depois.' },
]

export default function NovaCandidaturaPage() {
  const navigate = useNavigate()
  const { recarregarAlertas } = useWorkspace()

  return (
    <MainLayout title="Nova candidatura" backTo="/candidaturas">
      <p className={ui.intro}>Cole o link da vaga e preencha o resto.</p>
      <div className={styles.layout}>
        <section className={ui.card}>
          <CandidaturaForm
            valoresIniciais={{ titulo: '', empresa: '', link: '', plataformaId: null, dataCandidatura: dataLocalHoje(), observacao: '' }}
            textoSalvar="Salvar candidatura" textoSalvando="Salvando…" cancelarPara="/candidaturas"
            aviso={<Banner tom="Info"><b>A candidatura é criada sem status.</b><br />Depois de salvar, vamos perguntar se você já se candidatou.</Banner>}
            onSubmit={async dados => {
              const criada = await candidaturaService.criar(dados)
              recarregarAlertas()
              // O estado de navegação não sobrevive a recarregar a página: a pergunta aparece uma única vez.
              navigate(`/candidaturas/${criada.id}`, { state: { perguntarCandidatou: true } })
            }}
          />
        </section>
        <aside className={`${ui.card} ${styles.how}`} aria-labelledby="como-funciona">
          <h2 id="como-funciona" className={ui.cardTitle} style={{ fontSize: 18 }}>Como funciona</h2>
          <ol className={styles.steps}>
            {passos.map((p, i) => (
              <li key={p.titulo}><span className={styles.num}>{i + 1}</span><div><b>{p.titulo}</b><p>{p.texto}</p></div></li>
            ))}
          </ol>
        </aside>
      </div>
    </MainLayout>
  )
}
