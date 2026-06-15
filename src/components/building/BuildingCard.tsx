import type { Building, Player, PlayerBuilding } from '../../types'
import { canAffordBuilding, playerOwnsBuilding } from '../../lib/gameLogic'
import styles from './BuildingCard.module.css'

interface Props {
  building: Building
  player: Player
  playerBuildings: PlayerBuilding[]
  onSelect: (building: Building) => void
}

const FASE_COLORS: Record<string, string> = {
  '1': '#7c3aed',
  '2': '#0ea5e9',
  '3': '#f59e0b',
}

export function BuildingCard({ building, player, playerBuildings, onSelect }: Props) {
  const owned = playerOwnsBuilding(playerBuildings, building.id)
  const affordable = canAffordBuilding(player, building)
  const requirementMet = !building.requires_building_id || playerOwnsBuilding(playerBuildings, building.requires_building_id)
  const canBuild = !owned && affordable && requirementMet
  const color = FASE_COLORS[building.fase] ?? '#7c3aed'

  return (
    <button
      className={`${styles.card} ${owned ? styles.owned : ''} ${!canBuild && !owned ? styles.locked : ''}`}
      style={{ '--accent': color } as React.CSSProperties}
      onClick={() => onSelect(building)}
      disabled={owned}
    >
      <div className={styles.top}>
        <span className={styles.name}>{building.name}</span>
        {owned && <span className={styles.ownedBadge}>✓ Gebouwd</span>}
        {!owned && building.points_value > 0 && (
          <span className={styles.points}>🏆 {building.points_value}</span>
        )}
      </div>

      <p className={styles.desc}>{building.description}</p>

      {building.effect_description && (
        <p className={styles.effect}>✨ {building.effect_description}</p>
      )}

      <div className={styles.costs}>
        {building.cost_energy > 0 && <span>⚡{building.cost_energy}</span>}
        {building.cost_wood > 0 && <span>🪵{building.cost_wood}</span>}
        {building.cost_clay > 0 && <span>🧱{building.cost_clay}</span>}
        {building.cost_stone > 0 && <span>🪨{building.cost_stone}</span>}
        {building.cost_gold > 0 && <span>🪙{building.cost_gold}</span>}
        {building.cost_iron > 0 && <span>⚙️{building.cost_iron}</span>}
      </div>

      {!requirementMet && (
        <p className={styles.requirement}>🔒 Vereist een ander gebouw eerst</p>
      )}
      {requirementMet && !affordable && !owned && (
        <p className={styles.requirement}>Niet genoeg resources</p>
      )}
    </button>
  )
}