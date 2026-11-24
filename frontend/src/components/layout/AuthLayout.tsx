import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = { children: ReactNode; variant?: 'login' | 'cadastro' | 'confirmacao' }

export default function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  return (
    <main className={styles.page} data-variant={variant}>
      <section className={styles.brandPanel} aria-label="Organizador de candidaturas">
        <Link className={styles.brand} to="/login" aria-label="Organizador de candidaturas">
          <img className={styles.brandLogo} src="/logo-gencand.svg" alt="GenCand — Organizador de candidaturas" />
        </Link>
        <div className={styles.pitch}>
          <p className={styles.pitchTitle}>Acompanhe cada<br />candidatura em um<br />só lugar.</p>
          <ul><li>Status e histórico de cada vaga</li><li>Entrevistas, contatos e lembretes</li><li>Avisos quando uma vaga ficar parada</li></ul>
        </div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.formCard}>{children}</div>
      </section>
    </main>
  )
}
