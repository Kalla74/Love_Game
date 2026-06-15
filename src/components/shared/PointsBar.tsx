import styles from './PointsBar.module.css'

interface Props {
  points: number
}

export function PointsBar({ points }: Props) {
  const nextThreshold = points < 10 ? 10 : points < 20 ? 20 : 30
  const prevThreshold = points < 10 ? 0 : points < 20 ? 10 : 20
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