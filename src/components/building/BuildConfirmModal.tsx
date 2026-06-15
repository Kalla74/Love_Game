import type { Building, Player, PlayerBuilding } from '../../types'
import { canAffordBuilding, playerOwnsBuilding } from '../../lib/gameLogic'
import styles from './BuildConfirmModal.module.css'

interface Props {
  building: Building
  player: Player
  playerBuildings: PlayerBuilding[]
  onConfirm: () => void
  onCancel: () => void
}

export function BuildConfirmModal({ building, player, playerBuildings, onConfirm, onCancel }: Props) {
  const affordable = canAffordBuilding(player, building)
  const requirementMet = !building.requires_building_id || playerOwnsBuilding(playerBuildings, building.requires_building_id)
  const canBuild = affordable && requirementMet

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{building.name}</h2>
        <p className={styles.desc}>{building.description}</p>

        {building.effect_description && (
          <div className={styles.effect}>✨ {building.effect_description}</div>
        )}

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Kosten</span>
          <div className={styles.costs}>
            {building.cost_energy > 0 && <div className={styles.cost}><span>⚡</span><span>{building.cost_energy} energie</span></div>}
            {building.cost_wood > 0 && <div className={styles.cost}><span>🪵</span><span>{building.cost_wood} hout</span></div>}
            {building.cost_clay > 0 && <div className={styles.cost}><span>🧱</span><span>{building.cost_clay} klei</span></div>}
            {building.cost_stone > 0 && <div className={styles.cost}><span>🪨</span><span>{building.cost_stone} steen</span></div>}
            {building.cost_gold > 0 && <div className={styles.cost}><span>🪙</span><span>{building.cost_gold} goud</span></div>}
            {building.cost_iron > 0 && <div className={styles.cost}><span>⚙️</span><span>{building.cost_iron} ijzer</span></div>}
          </div>
        </div>

        {building.points_value > 0 && (
          <div className={styles.points}>🏆 +{building.points_value} punten</div>
        )}

        {!requirementMet && (
          <p className={styles.error}>🔒 Je hebt het vereiste gebouw nog niet gebouwd</p>
        )}
        {requirementMet && !affordable && (
          <p className={styles.error}>Niet genoeg resources om dit te bouwen</p>
        )}

        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel}>Annuleren</button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={!canBuild}>
            Bouwen
          </button>
        </div>
      </div>
    </div>
  )
}