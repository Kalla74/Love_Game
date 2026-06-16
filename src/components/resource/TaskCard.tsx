import type { RoundTaskCard } from '../../types'
import styles from './TaskCard.module.css'

interface Props {
  card: RoundTaskCard
  onChoose: (card: RoundTaskCard) => void
  isChosen: boolean
  energyReward?: number
}

const FASE_COLORS: Record<string, string> = {
  '1': '#7c3aed',
  '2': '#0ea5e9',
  '3': '#f59e0b',
}

export function TaskCard({ card, onChoose, isChosen, energyReward }: Props) {
  const task = card.task
  if (!task) return null

  const color = FASE_COLORS[task.fase] ?? '#7c3aed'
  const displayReward = energyReward ?? task.energy_reward

  return (
    <button
      className={`${styles.card} ${isChosen ? styles.chosen : ''}`}
      style={{ '--accent': color } as React.CSSProperties}
      onClick={() => onChoose(card)}
      disabled={isChosen}
    >
      <div className={styles.reward}>
        ⚡ {displayReward}
      </div>
      <div className={styles.name}>{task.name}</div>
      <div className={styles.desc}>{task.description}</div>
    </button>
  )
}