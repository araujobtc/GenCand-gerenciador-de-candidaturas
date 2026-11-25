import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useDismiss } from '../../hooks/useDismiss'
import Icon, { type IconName } from '../ui/Icon'
import { iniciais } from '../../utils/jwt'
import type { ThemePreference } from '../../theme/ThemeContext'
import styles from './ProfileMenu.module.css'

const temas: { valor: ThemePreference; label: string; icon: IconName }[] = [
  { valor: 'light', label: 'Claro', icon: 'sol' },
  { valor: 'dark', label: 'Escuro', icon: 'lua' },
  { valor: 'auto', label: 'Automático', icon: 'monitor' },
]

export default function ProfileMenu({ email }: { email: string | null }) {
  const { logout } = useAuth()
  const { preference, setPreference } = useTheme()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [aparencia, setAparencia] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const fechar = useCallback(() => { setAberto(false); setAparencia(false) }, [])
  useDismiss(raiz, aberto, fechar)

  function sair() { fechar(); logout(); navigate('/login', { replace: true }) }

  return (
    <div className={styles.wrap} ref={raiz}>
      <button type="button" className={styles.trigger} onClick={() => setAberto(v => !v)} aria-haspopup="menu" aria-expanded={aberto} aria-label="Menu do perfil">
        <span className={styles.avatar}>{iniciais(email)}</span>
        <Icon name="chevronDown" size={16} className={styles.caret} />
      </button>
      {aberto && (
        <div className={styles.menu} role="menu">
          <div className={styles.who}>
            <b>Minha conta</b>
            {email && <small>{email}</small>}
          </div>
          <Link role="menuitem" className={styles.item} to="/configuracoes#conta" onClick={fechar}><Icon name="usuario" />Minha conta</Link>
          <button type="button" role="menuitem" className={styles.item} aria-expanded={aparencia} onClick={() => setAparencia(v => !v)}>
            <Icon name="sol" />Aparência<Icon name="chevronDown" size={16} className={styles.push} />
          </button>
          {aparencia && (
            <div className={styles.themes} role="radiogroup" aria-label="Aparência">
              {temas.map(t => (
                <button key={t.valor} type="button" role="radio" aria-checked={preference === t.valor} className={styles.theme} onClick={() => setPreference(t.valor)}>
                  <Icon name={t.icon} size={16} />{t.label}{preference === t.valor && <Icon name="check" size={16} className={styles.push} />}
                </button>
              ))}
            </div>
          )}
          <Link role="menuitem" className={styles.item} to="/configuracoes" onClick={fechar}><Icon name="configuracoes" />Configurações</Link>
          <button type="button" role="menuitem" className={`${styles.item} ${styles.exit}`} onClick={sair}><Icon name="sair" />Sair</button>
        </div>
      )}
    </div>
  )
}
