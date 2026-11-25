import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Icon from '../components/ui/Icon'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Banner, EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import { curriculoService, type Curriculo } from '../api/services/workspaceService'
import styles from './CurriculosPage.module.css'
import ui from '../components/ui/ui.module.css'
import { useAutoLimpar } from '../hooks/useAutoLimpar'

const LIMITE = 2
const tamanho = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)
const ehPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')

export default function CurriculosPage() {
  const [itens, setItens] = useState<Curriculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [nome, setNome] = useState('')
  const [principal, setPrincipal] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [avisoLimite, setAvisoLimite] = useState('')
  const [excluindo, setExcluindo] = useState<Curriculo | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)

  useAutoLimpar(aviso, setAviso)
  useAutoLimpar(avisoLimite, setAvisoLimite)
  useAutoLimpar(erroEnvio, setErroEnvio)
  useAutoLimpar(erroAcao, setErroAcao)

  const carregar = useCallback(async () => {
    try { setItens(await curriculoService.listar()); setErro('') }
    catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível carregar os currículos.') }
    finally { setCarregando(false) }
  }, [])
  useEffect(() => { void Promise.resolve().then(carregar) }, [carregar])

  const cheio = itens.length >= LIMITE

  function escolher(f: File | null | undefined) {
    setErroEnvio('')
    if (!f) return
    if (!ehPdf(f)) { setArquivo(null); setErroEnvio('Envie apenas arquivos PDF. Tente novamente com outro arquivo.'); return }
    setArquivo(f)
    if (!nome) setNome(f.name.replace(/\.pdf$/i, ''))
  }
  function pedirEnvio() {
    if (cheio) {
      setAvisoLimite(`Você usa ${itens.length} de ${LIMITE} currículos. Exclua um para enviar outro.`)
      return
    }
    entrada.current?.click()
  }
  function soltar(e: DragEvent) { e.preventDefault(); setArrastando(false); cheio ? pedirEnvio() : escolher(e.dataTransfer.files?.[0]) }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return
    setEnviando(true); setErroEnvio('')
    try {
      await curriculoService.enviar(nome.trim() || arquivo.name.replace(/\.pdf$/i, ''), arquivo, principal || itens.length === 0)
      setArquivo(null); setNome(''); setPrincipal(false)
      if (entrada.current) entrada.current.value = ''
      setAviso('Currículo enviado com sucesso.')
      await carregar()
    } catch (err) { setErroEnvio(err instanceof Error ? err.message : 'Não foi possível enviar o currículo.') }
    finally { setEnviando(false) }
  }

  async function baixar(c: Curriculo) {
    try {
      const url = URL.createObjectURL(await curriculoService.baixar(c.id))
      const a = document.createElement('a'); a.href = url; a.download = `${c.nome}.pdf`; a.click(); URL.revokeObjectURL(url)
    } catch (e) { setErroAcao(e instanceof Error ? e.message : 'Não foi possível baixar o arquivo.') }
  }
  async function tornarPrincipal(c: Curriculo) {
    try { await curriculoService.definirPrincipal(c.id); await carregar() } catch (e) { setErroAcao(e instanceof Error ? e.message : 'Não foi possível alterar o principal.') }
  }

  const botaoEnviar = <button type="button" className={ui.primary} onClick={pedirEnvio}><Icon name="enviar" />Enviar currículo</button>

  return (
    <MainLayout title="Currículos" actions={botaoEnviar}>
      <p className={ui.intro}>Guarde seus PDFs aqui e baixe quando precisar. Só você tem acesso aos arquivos.</p>
      {aviso && <div className={styles.gap}><Banner tom="Success" role="status">{aviso}</Banner></div>}
      {avisoLimite && <div className={styles.gap}><Banner tom="Warn" role="status">{avisoLimite}</Banner></div>}
      {erroAcao && <div className={styles.gap}><Banner tom="Error" role="alert">{erroAcao}</Banner></div>}

      {carregando ? <Loading>Carregando currículos…</Loading> : erro ? <ErrorState message={erro} onRetry={() => { setCarregando(true); void carregar() }} /> : (
        <>
          {itens.length === 0 ? (
            <section className={ui.card}><EmptyState icon="curriculos" title="Nenhum currículo enviado">Envie um PDF abaixo e marque o principal.</EmptyState></section>
          ) : (
            <div className={styles.grid}>
              {itens.map(c => (
                <article key={c.id} className={ui.card}>
                  <div className={styles.cvHead}>
                    <span className={styles.fileIcon}><Icon name="curriculos" size={22} /></span>
                    <div><h2>{c.nome}</h2><p>PDF · {tamanho(c.tamanhoBytes)}</p></div>
                  </div>
                  {c.principal ? <span className={`${ui.badge} ${ui.tom_blue}`}><Icon name="estrela" size={12} />Principal</span> : (
                    <button type="button" className={`${ui.secondary} ${ui.compact}`} onClick={() => void tornarPrincipal(c)}><Icon name="estrela" size={16} />Definir como principal</button>
                  )}
                  <div className={styles.cvActions}>
                    <button type="button" className={ui.secondary} onClick={() => void baixar(c)}><Icon name="baixar" size={16} />Baixar</button>
                    <button type="button" className={ui.dangerGhost} onClick={() => setExcluindo(c)}><Icon name="lixeira" size={16} />Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <h2 className={styles.h2}>Enviar novo currículo</h2>
          <form onSubmit={e => void enviar(e)} className={styles.form}>
            <div className={`${styles.drop} ${arrastando ? styles.dropOn : ''} ${cheio ? styles.dropOff : ''}`}
              onDragOver={e => { e.preventDefault(); if (!cheio) setArrastando(true) }} onDragLeave={() => setArrastando(false)} onDrop={soltar}>
              <Icon name="enviar" size={22} />
              {arquivo ? <><b>{arquivo.name}</b><span>{tamanho(arquivo.size)} · pronto para enviar</span></>
                : <><b>Arraste um PDF aqui</b><span>ou escolha um arquivo do seu aparelho</span></>}
              <input ref={entrada} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={cheio} onChange={e => escolher(e.target.files?.[0])} aria-label="Escolher arquivo PDF" />
              <button type="button" className={ui.secondary} onClick={pedirEnvio}>Escolher arquivo</button>
            </div>
            {arquivo && !cheio && (
              <div className={styles.meta}>
                <div className={ui.field}><label className={ui.label} htmlFor="cv-nome">Nome do currículo</label><input id="cv-nome" className={ui.control} maxLength={120} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Currículo Backend" /></div>
                <label className={styles.check}><input type="checkbox" checked={principal} onChange={e => setPrincipal(e.target.checked)} />Definir como principal</label>
                <button type="submit" className={ui.primary} disabled={enviando}>{enviando ? <><span className={ui.spinner} aria-hidden="true" />Enviando…</> : 'Enviar currículo'}</button>
              </div>
            )}
            {erroEnvio && <Banner tom="Error" role="alert">{erroEnvio}</Banner>}
          </form>
        </>
      )}

      {excluindo && (
        <ConfirmDialog title="Excluir currículo?" subtitle={excluindo.nome} confirmLabel="Excluir"
          onClose={() => setExcluindo(null)} onConfirm={async () => { await curriculoService.excluir(excluindo.id); setExcluindo(null); setAvisoLimite(''); setAviso('Currículo excluído.'); await carregar() }}>
          O arquivo será removido e não poderá ser recuperado.
        </ConfirmDialog>
      )}
    </MainLayout>
  )
}
