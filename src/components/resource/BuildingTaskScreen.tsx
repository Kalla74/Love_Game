import { useState } from 'react'
import type { Room, Player, PlayerBuilding, Building } from '../../types'
import { ResourceBar } from '../building/ResourceBar'
import { FaseBadge } from '../shared/FaseBadge'
import styles from './BuildingTaskScreen.module.css'

interface Props {
  playerBuildings: PlayerBuilding[]
  player: Player
  room: Room
  conditionalBuildings: string[]
  onDone: (bonusPoints: number) => void
}

const FASE_LABELS: Record<string, string> = {
  '1': 'Fase 1',
  '2': 'Fase 2',
  '3': 'Fase 3',
}

export function BuildingTaskScreen({
  playerBuildings,
  player,
  room,
  conditionalBuildings,
  onDone,
}: Props) {
  const ownedBuildings = playerBuildings
    .map((pb) => pb.building)
    .filter(Boolean) as Building[]

  const taskBuildings = ownedBuildings.filter(
    (b) => !conditionalBuildings.includes(b.name)
  )
  const conditionalOwned = ownedBuildings.filter((b) =>
    conditionalBuildings.includes(b.name)
  )

  // Per conditional building: how many times triggered
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(conditionalOwned.map((b) => [b.id, 0]))
  )

  const [confirmed, setConfirmed] = useState(false)

  function setCount(id: string, val: number) {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, val) }))
  }

  const conditionalPoints = conditionalOwned.reduce((sum, b) => {
    return sum + (counts[b.id] ?? 0) * (b.points_value ?? 0)
  }, 0)

  function handleDone() {
    setConfirmed(true)
    onDone(conditionalPoints)
  }

  // Group task buildings by fase
  const grouped = taskBuildings.reduce<Record<string, Building[]>>((acc, b) => {
    if (!acc[b.fase]) acc[b.fase] = []
    acc[b.fase].push(b)
    return acc
  }, {})

  const hasAnything = taskBuildings.length > 0 || conditionalOwned.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FaseBadge fase={room.fase} />
        <span className={styles.round}>Ronde {room.current_round}</span>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>Gebouwtaken</h2>
        <p className={styles.sub}>
          Voer de taken van je gebouwen uit en vul in hoe vaak je conditionele acties hebt gedaan.
        </p>

        {!hasAnything && (
          <p className={styles.empty}>Je hebt nog geen gebouwen met taken.</p>
        )}

        {/* Round-production task buildings */}
        {taskBuildings.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 Rondetaken</h3>
            <p className={styles.sectionSub}>
              Voer deze taken nu uit — punten worden automatisch toegekend.
            </p>
            {Object.entries(grouped).map(([fase, list]) => (
              <div key={fase} className={styles.faseGroup}>
                <span className={styles.faseLabel}>{FASE_LABELS[fase]}</span>
                {list.map((b) => (
                  <div key={b.id} className={styles.taskCard}>
                    <div className={styles.taskInfo}>
                      <span className={styles.taskName}>{b.name}</span>
                      {b.effect_description && (
                        <span className={styles.taskDesc}>{b.effect_description}</span>
                      )}
                    </div>
                    <div className={styles.taskPoints}>
                      +{b.points_value} <span className={styles.ptLabel}>pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Conditional buildings */}
        {conditionalOwned.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>💋 Conditionele gebouwen</h3>
            <p className={styles.sectionSub}>
              Vul in hoe vaak je de actie hebt uitgevoerd — punten worden berekend.
            </p>
            {conditionalOwned.map((b) => (
              <div key={b.id} className={styles.conditionalCard}>
                <div className={styles.conditionalInfo}>
                  <span className={styles.taskName}>{b.name}</span>
                  {b.effect_description && (
                    <span className={styles.taskDesc}>{b.effect_description}</span>
                  )}
                  <span className={styles.perAction}>
                    +{b.points_value} pts per keer
                  </span>
                </div>
                <div className={styles.counter}>
                  <button
                    className={styles.counterBtn}
                    onClick={() => setCount(b.id, (counts[b.id] ?? 0) - 1)}
                  >
                    −
                  </button>
                  <span className={styles.counterVal}>{counts[b.id] ?? 0}</span>
                  <button
                    className={styles.counterBtn}
                    onClick={() => setCount(b.id, (counts[b.id] ?? 0) + 1)}
                  >
                    +
                  </button>
                </div>
                <div className={styles.conditionalTotal}>
                  = {(counts[b.id] ?? 0) * b.points_value} pts
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {hasAnything && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Rondetaken</span>
              <span>
                +{taskBuildings.reduce((s, b) => s + b.points_value, 0)} pts
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Conditioneel</span>
              <span>+{conditionalPoints} pts</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Totaal bonus</span>
              <span>
                +{taskBuildings.reduce((s, b) => s + b.points_value, 0) + conditionalPoints} pts
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <ResourceBar player={player} />
        <button
          className={styles.doneBtn}
          onClick={handleDone}
          disabled={confirmed}
        >
          {confirmed ? 'Bezig...' : 'Bevestigen & volgende fase →'}
        </button>
      </div>
    </div>
  )
}