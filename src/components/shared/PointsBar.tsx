import styles from './PointsBar.module.css'

interface Props {
  points: number
}

export function PointsBar({ points }: Props) {
  const nextThreshold = points < 10 ? 10 : points < 50 ? 50 : 200
  const prevThreshold = points < 10 ? 0 : points < 50 ? 10 : 50
  const progress = ((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.label}>🏆 {points} punten</span>
        <span className={styles.next}>→ {nextThreshold}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}