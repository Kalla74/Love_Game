import type { RoundTaskCard } from '../../types'
import styles from './CompleteTaskModal.module.css'

interface Props {
  card: RoundTaskCard
  onComplete: () => void
  onCancel: () => void
  loading: boolean
  faseNumber: number
  clothingTaskName: string
}

export function CompleteTaskModal({
  card,
  onComplete,
  onCancel,
  loading,
  faseNumber,
  clothingTaskName,
}: Props) {
  const task = card.task
  if (!task) return null

  const isClothingTask = task.name
    ?.toLowerCase()
    .includes(clothingTaskName.toLowerCase())

  const energyReward = isClothingTask ? faseNumber : task.energy_reward

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>⚡</div>
        <h2 className={styles.title}>{task.name}</h2>
        <p className={styles.desc}>{task.description}</p>
        <div className={styles.reward}>
          Beloning: <strong>{energyReward} energie</strong>
          {isClothingTask && (
            <span className={styles.faseNote}> (fase {faseNumber})</span>
          )}
        </div>
        <p className={styles.confirm}>Heb je deze taak voltooid?</p>
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Annuleren
          </button>
          <button className={styles.confirmBtn} onClick={onComplete} disabled={loading}>
            {loading ? 'Bezig...' : '✓ Voltooid!'}
          </button>
        </div>
      </div>
    </div>
  )
}