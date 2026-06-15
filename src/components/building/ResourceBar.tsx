import type { Player } from '../../types'
import styles from './ResourceBar.module.css'

interface Props {
  player: Player
}

const RESOURCES = [
  { key: 'energy', icon: '⚡', label: 'Energie' },
  { key: 'wood', icon: '🪵', label: 'Hout' },
  { key: 'clay', icon: '🧱', label: 'Klei' },
  { key: 'stone', icon: '🪨', label: 'Steen' },
  { key: 'gold', icon: '🪙', label: 'Goud' },
  { key: 'iron', icon: '⚙️', label: 'IJzer' },
] as const

export function ResourceBar({ player }: Props) {
  return (
    <div className={styles.bar}>
      {RESOURCES.map(({ key, icon, label }) => (
        <div key={key} className={styles.resource}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.value}>{player[key]}</span>
        </div>
      ))}
    </div>
  )
}