import type { Building, Player, PlayerBuilding } from '../../types'
import { BuildingCard } from './BuildingCard'
import styles from './BuildingGrid.module.css'

interface Props {
  buildings: Building[]
  playerBuildings: PlayerBuilding[]
  player: Player
  onSelect: (building: Building) => void
}

const FASE_LABELS: Record<string, string> = {
  '1': 'Fase 1',
  '2': 'Fase 2',
  '3': 'Fase 3',
}

export function BuildingGrid({ buildings, playerBuildings, player, onSelect }: Props) {
  const grouped = buildings.reduce<Record<string, Building[]>>((acc, b) => {
    if (!acc[b.fase]) acc[b.fase] = []
    acc[b.fase].push(b)
    return acc
  }, {})

  return (
    <div className={styles.wrapper}>
      {Object.entries(grouped).map(([fase, list]) => (
        <div key={fase} className={styles.group}>
          <h3 className={styles.groupLabel}>{FASE_LABELS[fase]}</h3>
          <div className={styles.list}>
            {list.map((b) => (
              <BuildingCard
                key={b.id}
                building={b}
                player={player}
                playerBuildings={playerBuildings}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}