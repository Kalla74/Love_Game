import styles from './StartButton.module.css'

interface Props {
  playerCount: number
  onStart: () => void
  loading: boolean
}

export function StartButton({ playerCount, onStart, loading }: Props) {
  const canStart = playerCount >= 2

  return (
    <div className={styles.wrapper}>
      {!canStart && (
        <p className={styles.hint}>
          Wacht op minimaal 2 spelers om te starten
        </p>
      )}
      <button
        className={styles.button}
        onClick={onStart}
        disabled={!canStart || loading}
      >
        {loading ? 'Starten...' : `Spel starten (${playerCount} spelers)`}
      </button>
    </div>
  )
}