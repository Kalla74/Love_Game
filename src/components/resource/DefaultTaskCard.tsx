import styles from './DefaultTaskCard.module.css'

interface Props {
  onChoose: () => void
  loading: boolean
}

export function DefaultTaskCard({ onChoose, loading }: Props) {
  return (
    <button className={styles.card} onClick={onChoose} disabled={loading}>
      <div className={styles.top}>
        <span className={styles.icon}>👕</span>
        <span className={styles.reward}>⚡ 1</span>
      </div>
      <div className={styles.name}>Kledingstuk uittrekken</div>
      <div className={styles.desc}>Trek 1 kledingstuk uit om 1 energie te verdienen</div>
    </button>
  )
}