import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Icon, { type IconName } from '../ui/Icon'
import NotificationsBell from '../notifications/NotificationsBell'
import ProfileMenu from './ProfileMenu'
import { emailDoToken, iniciais, nomeDoEmail } from '../../utils/jwt'
import styles from './MainLayout.module.css'

const CHAVE_MENU = 'sidebar-expanded'
const itens: { to: string; label: string; icon: IconName }[] = [
  { to: '/painel', label: 'Painel', icon: 'painel' },
  { to: '/candidaturas', label: 'Candidaturas', icon: 'candidaturas' },
  { to: '/plataformas', label: 'Plataformas', icon: 'plataformas' },
  { to: '/curriculos', label: 'Currículos', icon: 'curriculos' },
  { to: '/configuracoes', label: 'Configurações', icon: 'configuracoes' },
]

interface MainLayoutProps {
  title: string
  /** Ação principal contextual, mostrada no cabeçalho (só no computador). */
  actions?: ReactNode
  /** No celular, mostra a seta de voltar antes do título (telas de detalhe). */
  backTo?: string
  children: ReactNode
}

function lerExpandido(): boolean {
  try { return localStorage.getItem(CHAVE_MENU) === 'true' } catch { return false }
}

export default function MainLayout({ title, actions, backTo, children }: MainLayoutProps) {
  const { token } = useAuth()
  const email = emailDoToken(token)
  const [expandido, setExpandido] = useState(lerExpandido)

  function alternarMenu() {
    setExpandido(atual => {
      try { localStorage.setItem(CHAVE_MENU, String(!atual)) } catch { /* sem armazenamento */ }
      return !atual
    })
  }

  return (
    <div className={`${styles.shell} ${expandido ? styles.expanded : ''}`}>
      <aside className={styles.sidebar} aria-label="Menu lateral">
        <Link to="/painel" className={styles.brand} aria-label="GenCand — ir para o Painel">
          <img className={styles.brandIcon} src="/logo-gencand-icone.svg" alt="" />
          <img className={`${styles.brandFull} ${styles.onLight}`} src="/logo-gencand.svg" alt="" />
          <img className={`${styles.brandFull} ${styles.onDark}`} src="/logo-gencand-branco.svg" alt="" />
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          {itens.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} data-tooltip={item.label}>
              <Icon name={item.icon} size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button type="button" className={styles.collapse} onClick={alternarMenu} aria-expanded={expandido} data-tooltip={expandido ? 'Recolher menu' : 'Expandir menu'}>
            <Icon name={expandido ? 'recolher' : 'expandir'} size={20} />
            <span className={styles.navLabel}>{expandido ? 'Recolher menu' : 'Expandir menu'}</span>
          </button>
          <Link to="/configuracoes#conta" className={styles.account} data-tooltip="Minha conta">
            <span className={styles.avatar} aria-hidden="true">{iniciais(email)}</span>
            <span className={styles.accountText}><b>{nomeDoEmail(email)}</b><small>Minha conta</small></span>
          </Link>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          {backTo && <Link to={backTo} className={styles.back} aria-label="Voltar"><Icon name="chevronLeft" size={22} /></Link>}
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.headerRight}>
            {actions && <div className={styles.headerActions}>{actions}</div>}
            <NotificationsBell />
            <ProfileMenu email={email} />
          </div>
        </header>
        <main className={styles.content} id="conteudo">{children}</main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navegação principal (celular)">
        {itens.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomActive : ''}`}>
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
