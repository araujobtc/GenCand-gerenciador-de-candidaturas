import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useDismiss } from '../../hooks/useDismiss'
import Icon from '../ui/Icon'
import { formatarInstante } from '../../utils/tempo'
import styles from './NotificationsBell.module.css'

export default function NotificationsBell() {
  const { alertas, lidas, naoLidas, marcarLida, marcarTodasLidas } = useWorkspace()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const fechar = useCallback(() => setAberto(false), [])
  useDismiss(raiz, aberto, fechar)

  function abrir(id: string, candidaturaId: string) {
    marcarLida(id)
    fechar()
    navigate(`/candidaturas/${candidaturaId}`)
  }

  return (
    <div className={styles.wrap} ref={raiz}>
      <button type="button" className={styles.bell} onClick={() => setAberto(v => !v)} aria-haspopup="dialog" aria-expanded={aberto}
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}>
        <Icon name="sino" size={20} />
        {naoLidas > 0 && <span className={styles.dot} aria-hidden="true" />}
      </button>

      {aberto && (
        <div className={styles.panel} role="dialog" aria-label="Notificações">
          <div className={styles.head}>
            <button type="button" className={styles.backBtn} onClick={fechar} aria-label="Fechar notificações"><Icon name="chevronLeft" size={22} /></button>
            <h2>Notificações</h2>
          </div>
          <div className={styles.sub}>
            <span>As 10 mais recentes</span>
            <button type="button" className={styles.link} onClick={marcarTodasLidas} disabled={naoLidas === 0}>Marcar todas como lidas</button>
          </div>
          {alertas.length === 0 ? (
            <p className={styles.empty}>Nenhuma notificação por enquanto. Avisaremos quando uma candidatura ficar parada ou sem status.</p>
          ) : (
            <ul className={styles.list}>
              {alertas.map(a => {
                const lida = lidas.has(a.id)
                return (
                  <li key={a.id}>
                    <button type="button" className={styles.item} onClick={() => abrir(a.id, a.candidaturaId)}>
                      <span className={`${styles.icon} ${a.tipo === 'parada' ? styles.warn : styles.info}`}><Icon name="alerta" size={18} /></span>
                      <span className={styles.text}>
                        <b>{a.titulo}</b>
                        <span>{a.descricao}</span>
                        <small>{formatarInstante(a.data)}{lida ? ' · lida' : ''}</small>
                      </span>
                      {!lida && <span className={styles.unread} aria-label="não lida" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
