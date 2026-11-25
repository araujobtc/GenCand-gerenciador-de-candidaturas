import type { StatusCandidatura } from '../../types/candidatura'
import { STATUS } from './status'
import styles from './ui.module.css'

/**
 * Selo de status. O grupo não depende só da cor: em andamento usa o marcador vazado (anel)
 * e os finais usam o marcador preenchido.
 */
export default function StatusBadge({ status }: { status: StatusCandidatura | null }) {
  if (!status) return <span className={`${styles.badge} ${styles.badgeNone}`}>Sem status</span>
  const info = STATUS[status]
  return (
    <span className={`${styles.badge} ${styles[`tom_${info.tom}`]}`}>
      <i className={info.grupo === 'final' ? styles.dotFilled : styles.dotRing} aria-hidden="true" />
      {info.label}
    </span>
  )
}
