import type { Player, PlayerBuilding } from '../../types'
import styles from './WorldView.module.css'

interface Props {
  playerBuildings: PlayerBuilding[]
  player: Player
}

export function WorldView({ playerBuildings, player }: Props) {
  if (playerBuildings.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌱</div>
        <p className={styles.emptyText}>Nog geen gebouwen</p>
        <p className={styles.emptySub}>Bouw je eerste gebouw om je wereld te starten!</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.worldName}>{player.world_name}</div>
      <div className={styles.grid}>
        {playerBuildings.map((pb) => {
          const b = pb.building
          if (!b) return null
          return (
            <div key={pb.id} className={styles.item}>
              <div className={styles.itemIcon}>🏛️</div>
              <div className={styles.itemName}>{b.name}</div>
              {b.points_value > 0 && (
                <div className={styles.itemPoints}>🏆 {b.points_value}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}