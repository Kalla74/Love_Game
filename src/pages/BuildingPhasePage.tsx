import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../hooks/usePlayer'
import { usePlayers } from '../hooks/usePlayers'
import { BuildingGrid } from '../components/building/BuildingGrid'
import { WorldView } from '../components/building/WorldView'
import { ResourceBar } from '../components/building/ResourceBar'
import { BuildConfirmModal } from '../components/building/BuildConfirmModal'
import { FaseBadge } from '../components/shared/FaseBadge'
import { PointsBar } from '../components/shared/PointsBar'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { getFaseFromPoints, checkWin, canAffordBuilding, playerOwnsBuilding, calcBuildingProduction } from '../lib/gameLogic'
import type { Room, Player, Building, PlayerBuilding } from '../types'
import styles from './BuildingPhasePage.module.css'

interface Props {
  room: Room
  player: Player
  onPhaseComplete: () => void
}

type Tab = 'build' | 'world'

export function BuildingPhasePage({ room, player, onPhaseComplete }: Props) {
  const { player: freshPlayer, refetch: refetchPlayer } = usePlayer(player.id)
  const { players } = usePlayers(room.id)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [playerBuildings, setPlayerBuildings] = useState<PlayerBuilding[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [tab, setTab] = useState<Tab>('build')

  const currentPlayer = freshPlayer ?? player

  useEffect(() => {
    fetchData()
  }, [player.id])

  async function fetchData() {
    setLoading(true)
    const [{ data: allBuildings }, { data: owned }] = await Promise.all([
      supabase.from('buildings').select('*').eq('is_active', true).order('fase').order('points_value'),
      supabase.from('player_buildings').select('*, building:buildings(*)').eq('player_id', player.id),
    ])
    setBuildings(allBuildings ?? [])
    setPlayerBuildings(owned ?? [])
    setLoading(false)
  }

  async function handleBuild(building: Building) {
    const p = currentPlayer

    // Deduct costs
    const { error } = await supabase
      .from('players')
      .update({
        energy: p.energy - building.cost_energy,
        wood: p.wood - building.cost_wood,
        clay: p.clay - building.cost_clay,
        stone: p.stone - building.cost_stone,
        gold: p.gold - building.cost_gold,
        iron: p.iron - building.cost_iron,
        points: p.points + building.points_value,
      })
      .eq('id', player.id)

    if (error) return

    await supabase.from('player_buildings').insert({
      player_id: player.id,
      building_id: building.id,
    })

    await supabase.from('room_events').insert({
      room_id: room.id,
      player_id: player.id,
      event_type: 'building_built',
      payload: { building_id: building.id, building_name: building.name },
    })

    setSelectedBuilding(null)
    await refetchPlayer()
    await fetchData()

    // Check win condition
    const newPoints = p.points + building.points_value
    if (checkWin(newPoints)) {
      await supabase.from('rooms').update({ is_active: false }).eq('id', room.id)
      await supabase.from('room_events').insert({
        room_id: room.id,
        player_id: player.id,
        event_type: 'game_won',
        payload: { winner_id: player.id },
      })
      onPhaseComplete()
      return
    }

    // Update fase if needed
    const maxPoints = Math.max(...players.map((pl) => pl.points), newPoints)
    const newFase = getFaseFromPoints(maxPoints)
    if (newFase !== room.fase) {
      await supabase.from('rooms').update({ fase: newFase }).eq('id', room.id)
      await supabase.from('room_events').insert({
        room_id: room.id,
        event_type: 'fase_change',
        payload: { fase: newFase },
      })
    }
  }

  async function handleFinishRound() {
    setFinishing(true)
    try {
      const ownedBuildingData = playerBuildings.map((pb) => pb.building).filter(Boolean) as Building[]
      const production = calcBuildingProduction(ownedBuildingData)

      await supabase
        .from('players')
        .update({
          wood: currentPlayer.wood + production.wood,
          clay: currentPlayer.clay + production.clay,
          stone: currentPlayer.stone + production.stone,
          gold: currentPlayer.gold + production.gold,
          iron: currentPlayer.iron + production.iron,
          energy: currentPlayer.energy + production.energy,
          has_done_building_phase: true,  // <-- alleen dit zetten
        })
        .eq('id', player.id)

      await checkAllFinished()
    } finally {
      setFinishing(false)
    }
  }

  async function checkAllFinished() {
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id, has_done_building_phase')
      .eq('room_id', room.id)

    const allDone = allPlayers?.every((p) => p.has_done_building_phase)
    if (!allDone) return

    // Iedereen is klaar -> reset BEIDE vlaggen voor IEDEREEN in één keer,
    // en pas DAN de phase/round van de room aan
    await supabase
      .from('players')
      .update({ has_done_resource_phase: false, has_done_building_phase: false })
      .eq('room_id', room.id)

    await supabase
      .from('rooms')
      .update({
        current_phase: 'resource',
        current_round: room.current_round + 1,
      })
      .eq('id', room.id)

    await supabase.from('room_events').insert({
      room_id: room.id,
      event_type: 'round_advance',
      payload: { round: room.current_round + 1 },
    })

    onPhaseComplete()
  }

  if (loading) return <LoadingSpinner label="Gebouwen laden..." />

  if (currentPlayer.has_done_building_phase) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <FaseBadge fase={room.fase} />
          <span className={styles.round}>Ronde {room.current_round}</span>
          <PointsBar points={currentPlayer.points} />
        </div>
        <div className={styles.waiting}>
          <div className={styles.waitIcon}>⏳</div>
          <p className={styles.waitTitle}>Ronde afgerond!</p>
          <p className={styles.waitSub}>Wachten op andere spelers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FaseBadge fase={room.fase} />
        <span className={styles.round}>Ronde {room.current_round}</span>
        <PointsBar points={currentPlayer.points} />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'build' ? styles.activeTab : ''}`}
          onClick={() => setTab('build')}
        >
          🏗️ Bouwen
        </button>
        <button
          className={`${styles.tab} ${tab === 'world' ? styles.activeTab : ''}`}
          onClick={() => setTab('world')}
        >
          🌍 Mijn Wereld
        </button>
      </div>

      <div className={styles.body}>
        {tab === 'build' ? (
          <BuildingGrid
            buildings={buildings}
            playerBuildings={playerBuildings}
            player={currentPlayer}
            onSelect={setSelectedBuilding}
          />
        ) : (
          <WorldView
            playerBuildings={playerBuildings}
            player={currentPlayer}
          />
        )}
      </div>

      <div className={styles.footer}>
        <ResourceBar player={currentPlayer} />
        <button
          className={styles.finishBtn}
          onClick={handleFinishRound}
          disabled={finishing}
        >
          {finishing ? 'Bezig...' : 'Ronde beëindigen →'}
        </button>
      </div>

      {selectedBuilding && (
        <BuildConfirmModal
          building={selectedBuilding}
          player={currentPlayer}
          playerBuildings={playerBuildings}
          onConfirm={() => handleBuild(selectedBuilding)}
          onCancel={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  )
}