import styles from './DefaultTaskCard.module.css'

// AFTER:
interface Props {
  onChoose: () => void
  loading: boolean
  faseNumber: number
}

export function DefaultTaskCard({ onChoose, loading, faseNumber }: Props) {
  return (
    <button className={styles.card} onClick={onChoose} disabled={loading}>
      <div className={styles.top}>
        <span className={styles.icon}>👕</span>
        <span className={styles.reward}>⚡ {faseNumber}</span>
      </div>
      <div className={styles.name}>Kledingstuk uittrekken</div>
      <div className={styles.desc}>Trek 1 kledingstuk uit om {faseNumber} energie te verdienen</div>
    </button>
  )
}