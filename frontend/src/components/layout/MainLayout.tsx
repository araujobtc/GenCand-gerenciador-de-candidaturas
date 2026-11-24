import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './MainLayout.module.css'

export default function MainLayout({ title, children }: { title: string; children: ReactNode }) {
  const { logout } = useAuth()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const candidaturasAtiva = location.pathname.startsWith('/candidaturas')

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/candidaturas" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">✓</span>
          <span><b>Organizador</b><small>de candidaturas</small></span>
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <span className={styles.navItem} aria-disabled="true" title="Disponível em versão futura">▦　Painel</span>
          <Link className={candidaturasAtiva ? styles.active : styles.navItem} to="/candidaturas">▤　Candidaturas</Link>
          <span className={styles.navItem} aria-disabled="true" title="Disponível em versão futura">▧　Plataformas</span>
          <span className={styles.navItem} aria-disabled="true" title="Disponível em versão futura">▤　Currículos</span>
          <span className={styles.navItem} aria-disabled="true" title="Disponível em versão futura">⚙　Configurações</span>
        </nav>
        <div className={styles.sidebarBottom}>
          <span aria-disabled="true">‹　Recolher menu</span>
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">GC</span>
            <span><b>Minha conta</b><small>Conta GenCand</small></span>
            <button className={styles.logout} onClick={logout} aria-label="Sair da conta" title="Sair">↪</button>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.topbar}>
          <h1>{title}</h1>
          <button
            className={styles.menuToggle}
            type="button"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="mobile-navigation"
            onClick={() => setMenuAberto(aberto => !aberto)}
          >
            <span aria-hidden="true">{menuAberto ? '×' : '☰'}</span>
          </button>
          <span className={styles.user} aria-hidden="true">GC</span>
        </header>

        {menuAberto && (
          <nav className={styles.mobileNav} id="mobile-navigation" aria-label="Navegação mobile">
            <Link
              className={candidaturasAtiva ? styles.mobileActive : styles.mobileNavItem}
              to="/candidaturas"
              onClick={() => setMenuAberto(false)}
            >
              Candidaturas
            </Link>
            <button className={styles.mobileLogout} type="button" onClick={logout}>Sair da conta</button>
          </nav>
        )}
        {children}
      </main>
    </div>
  )
}
