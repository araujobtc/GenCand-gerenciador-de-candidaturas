import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import CandidaturaForm from '../components/candidatura/CandidaturaForm'
import { ErrorState, Loading } from '../components/ui/Feedback'
import { candidaturaService } from '../api/services/candidaturaService'
import { useWorkspace } from '../hooks/useWorkspace'
import { formatarData } from '../utils/date'
import type { CandidaturaResponse } from '../types/candidatura'
import ui from '../components/ui/ui.module.css'

export default function EditarCandidaturaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recarregarAlertas } = useWorkspace()
  const [candidatura, setCandidatura] = useState<CandidaturaResponse | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    if (!id) return
    candidaturaService.buscarPorId(id)
      .then(c => { if (ativo) setCandidatura(c) })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível carregar a candidatura.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [id, tentativa])

  const voltar = id ? `/candidaturas/${id}` : '/candidaturas'

  return (
    <MainLayout title="Editar candidatura" backTo={voltar}>
      <p className={ui.intro}>Atualize as informações desta oportunidade.</p>
      <section className={ui.card} style={{ maxWidth: 760 }}>
        {!id ? <ErrorState message="Identificador da candidatura não informado." />
          : carregando ? <Loading>Carregando candidatura…</Loading>
          : erro || !candidatura ? <ErrorState message={erro || 'Candidatura não encontrada.'} onRetry={() => { setCarregando(true); setErro(''); setTentativa(t => t + 1) }} />
          : (
            <CandidaturaForm
              valoresIniciais={{
                titulo: candidatura.titulo, empresa: candidatura.empresa, link: candidatura.link ?? '',
                plataformaId: candidatura.plataformaId ?? '',
                dataCandidatura: candidatura.dataCandidatura ? formatarData(candidatura.dataCandidatura) : '',
                observacao: candidatura.observacao ?? '',
              }}
              statusInicial={candidatura.status}
              permitirAlterarStatus
              textoSalvar="Salvar alterações" textoSalvando="Salvando…" cancelarPara={voltar}
              onSubmit={async (dados, novoStatus) => {
                await candidaturaService.atualizar(candidatura.id, dados)
                if (novoStatus && novoStatus !== candidatura.status) {
                  await candidaturaService.atualizarStatus(candidatura.id, { status: novoStatus })
                }
                recarregarAlertas()
                navigate(voltar)
              }}
            />
          )}
      </section>
    </MainLayout>
  )
}
