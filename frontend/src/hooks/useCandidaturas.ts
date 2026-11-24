import { useCallback, useEffect, useState } from 'react'
import { candidaturaService } from '../api/services/candidaturaService'
import type { CandidaturaResponse, PageMetadata } from '../types/candidatura'

const PAGINA_VAZIA: PageMetadata = { size: 20, number: 0, totalElements: 0, totalPages: 0 }

export function useCandidaturas() {
  const [candidaturas, setCandidaturas] = useState<CandidaturaResponse[]>([])
  const [pagina, setPagina] = useState<PageMetadata>(PAGINA_VAZIA)
  const [numeroPagina, setNumeroPagina] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const atualizarNaLista = useCallback((candidaturaAtualizada: CandidaturaResponse) => {
    setCandidaturas(itens => itens.map(item => item.id === candidaturaAtualizada.id ? candidaturaAtualizada : item))
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const resposta = await candidaturaService.listar(numeroPagina)
      setCandidaturas(resposta.content)
      setPagina(resposta.page)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar as candidaturas.')
    } finally {
      setCarregando(false)
    }
  }, [numeroPagina])

  useEffect(() => {
    let ativo = true
    void Promise.resolve().then(() => {
      if (ativo) return carregar()
    })
    return () => { ativo = false }
  }, [carregar])

  return { candidaturas, pagina, numeroPagina, setNumeroPagina, carregando, erro, recarregar: carregar, atualizarNaLista }
}
