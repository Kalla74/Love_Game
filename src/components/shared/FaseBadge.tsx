import type { Fase } from '../../types'
import styles from './FaseBadge.module.css'

interface Props {
  fase: Fase
}

const FASE_CONFIG = {
  '1': { label: 'Fase 1', color: '#7c3aed' },
  '2': { label: 'Fase 2', color: '#0ea5e9' },
  '3': { label: 'Fase 3', color: '#f59e0b' },
}

export function FaseBadge({ fase }: Props) {
  const config = FASE_CONFIG[fase]
  return (
    <span
      className={styles.badge}
      style={{ '--color': config.color } as React.CSSProperties}
    >
      {config.label}
    </span>
  )
}