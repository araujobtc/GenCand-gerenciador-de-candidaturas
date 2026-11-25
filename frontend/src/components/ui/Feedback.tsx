import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'
import styles from './ui.module.css'

type Tom = 'Info' | 'Warn' | 'Error' | 'Success' | 'Purple'
const iconePorTom: Record<Tom, IconName> = { Info: 'info', Warn: 'alerta', Error: 'alerta', Success: 'verificar', Purple: 'info' }

export function Banner({ tom = 'Info', children, action, role }: { tom?: Tom; children: ReactNode; action?: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <div className={`${styles.banner} ${styles[`banner${tom}`]}`} role={role}>
      <Icon name={iconePorTom[tom]} />
      <div className={styles.bannerBody}>{children}</div>
      {action}
    </div>
  )
}

export function Loading({ children = 'Carregando…' }: { children?: ReactNode }) {
  return <p className={styles.state} role="status"><span className={styles.spinner} aria-hidden="true" />{children}</p>
}

export function EmptyState({ icon = 'info', title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.state}>
      <span className={styles.stateIcon}><Icon name={icon} size={22} /></span>
      <strong className={styles.stateTitle}>{title}</strong>
      {children && <div>{children}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.state} role="alert">
      <strong className={styles.stateTitle}>Algo deu errado</strong>
      <div>{message}</div>
      {onRetry && <div style={{ marginTop: 14 }}><button type="button" className={styles.secondary} onClick={onRetry}>Tentar novamente</button></div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={styles.toggle} onClick={() => onChange(!checked)} />
}
