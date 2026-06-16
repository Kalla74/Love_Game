import type { Building, Player, PlayerBuilding } from '../../types'
import { BuildingCard } from './BuildingCard'
import styles from './BuildingGrid.module.css'

interface Props {
  buildings: Building[]
  playerBuildings: PlayerBuilding[]
  player: Player
  currentFase: string
  onSelect: (building: Building) => void
}

const FASE_LABELS: Record<string, string> = {
  '1': 'Fase 1',
  '2': 'Fase 2',
  '3': 'Fase 3',
}

const FASE_COLORS: Record<string, string> = {
  '1': '#059669',
  '2': '#2563eb',
  '3': '#7c3aed',
}

export function BuildingGrid({
  buildings,
  playerBuildings,
  player,
  currentFase,
  onSelect,
}: Props) {
  // Only show buildings of current fase and lower
  const filtered = buildings.filter(
    (b) => parseInt(b.fase) <= parseInt(currentFase)
  )

  const grouped = filtered.reduce<Record<string, Building[]>>((acc, b) => {
    if (!acc[b.fase]) acc[b.fase] = []
    acc[b.fase].push(b)
    return acc
  }, {})

  return (
    <div className={styles.wrapper}>
      {Object.entries(grouped)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([fase, list]) => (
          <div key={fase} className={styles.group}>
            <div className={styles.groupHeader}>
              <span
                className={styles.faseDot}
                style={{ background: FASE_COLORS[fase] }}
              />
              <h3 className={styles.groupLabel}>{FASE_LABELS[fase]}</h3>
              <span className={styles.groupCount}>{list.length} gebouwen</span>
            </div>
            <div className={styles.grid}>
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