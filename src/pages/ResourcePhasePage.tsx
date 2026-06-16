import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../hooks/usePlayer'
import { usePlayers } from '../hooks/usePlayers'
import { TaskCardGrid } from '../components/resource/TaskCardGrid'
import { CompleteTaskModal } from '../components/resource/CompleteTaskModal'
import { DefaultTaskCard } from '../components/resource/DefaultTaskCard'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ResourceBar } from '../components/building/ResourceBar'
import { FaseBadge } from '../components/shared/FaseBadge'
import { BuildingTaskScreen } from '../components/resource/BuildingTaskScreen'
import type { Room, Player, RoundTaskCard, Building, PlayerBuilding } from '../types'
import styles from './ResourcePhasePage.module.css'
import { getFaseFromPoints } from '../lib/gameLogic'

// These buildings give conditional points (not per-round production)
const CONDITIONAL_BUILDINGS = ['The Kiss Bench', 'Swap Tower', 'Museum', 'Statue', 'Park', 'Cave']

interface Props {
  room: Room
  player: Player
  onPhaseComplete: () => void
}

type Screen = 'cards' | 'building_tasks' | 'waiting'

export function ResourcePhasePage({ room, player, onPhaseComplete }: Props) {
  const { player: freshPlayer, refetch: refetchPlayer } = usePlayer(player.id)
  const { players } = usePlayers(room.id)
  const [cards, setCards] = useState<RoundTaskCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<RoundTaskCard | null>(null)
  const [completing, setCompleting] = useState(false)
  const [screen, setScreen] = useState<Screen>('cards')
  const [playerBuildings, setPlayerBuildings] = useState<PlayerBuilding[]>([])
  const dealingRef = useRef(false)

  const currentPlayer = freshPlayer ?? player
  const alreadyDone = currentPlayer.has_done_resource_phase

  // Clothing task name — adjust this to match your actual task name in the DB
  const CLOTHING_TASK_NAME = 'Kledingstuk'

  const fase = room.fase
  const faseNumber = parseInt(fase)

  const opponents = players.filter((p) => p.id !== player.id)

  useEffect(() => {
    setScreen('cards')
    setCards([])
    dealingRef.current = false
    dealCards()
    fetchPlayerBuildings()
  }, [player.id, room.current_round])

  async function fetchPlayerBuildings() {
    const { data } = await supabase
      .from('player_buildings')
      .select('*, building:buildings(*)')
      .eq('player_id', player.id)
    setPlayerBuildings(data ?? [])
  }

  async function dealCards() {
    setLoading(true)

    const { data: existing } = await supabase
      .from('round_task_cards')
      .select('*, task:tasks(*)')
      .eq('player_id', player.id)
      .eq('round_number', room.current_round)

    if (existing && existing.length > 0) {
      setCards(existing)
      setLoading(false)
      return
    }

    // Prevent double-insert if dealCards fires twice before first insert completes
    if (dealingRef.current) {
      setLoading(false)
      return
    }
    dealingRef.current = true

    const fasesToFetch = Array.from({ length: faseNumber }, (_, i) => String(i + 1))

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .in('fase', fasesToFetch)
      .eq('is_active', true)

    if (!tasks || tasks.length === 0) {
      setLoading(false)
      return
    }

    // Pick 4 random tasks from the full pool
    const shuffled = [...tasks].sort(() => Math.random() - 0.5).slice(0, 4)

    const inserts = shuffled.map((t) => ({
      player_id: player.id,
      task_id: t.id,
      round_number: room.current_round,
    }))

    const { data: inserted } = await supabase
      .from('round_task_cards')
      .insert(inserts)
      .select('*, task:tasks(*)')

    setCards(inserted ?? [])
    setLoading(false)
  }

  async function handleChooseCard(card: RoundTaskCard) {
    await supabase
      .from('round_task_cards')
      .update({ is_chosen: true })
      .eq('id', card.id)

    setSelectedCard({ ...card, is_chosen: true })
  }

  async function handleCompleteTask(card: RoundTaskCard) {
    setCompleting(true)
    try {
      // Clothing task energy = fase number, all others use their own energy_reward
      const isClothingTask = card.task?.name
        ?.toLowerCase()
        .includes(CLOTHING_TASK_NAME.toLowerCase())

        const taskFase = parseInt(card.task?.fase ?? '1')
        const energyReward = isClothingTask
          ? taskFase
          : (card.task?.energy_reward ?? 1)

      await supabase
        .from('round_task_cards')
        .update({ is_completed: true })
        .eq('id', card.id)

      await supabase
        .from('players')
        .update({
          energy: currentPlayer.energy + energyReward,
        })
        .eq('id', player.id)

      await supabase.from('room_events').insert({
        room_id: room.id,
        player_id: player.id,
        event_type: 'task_completed',
        payload: { card_id: card.id, energy_reward: energyReward },
      })

      setSelectedCard(null)
      await refetchPlayer()

      // Go to building tasks screen before marking phase done
      setScreen('building_tasks')
    } finally {
      setCompleting(false)
    }
  }

  async function handleDefaultTask() {
    setCompleting(true)
    try {
      await supabase
        .from('players')
        .update({
          energy: currentPlayer.energy + faseNumber,
        })
        .eq('id', player.id)

      await supabase.from('room_events').insert({
        room_id: room.id,
        player_id: player.id,
        event_type: 'task_completed',
        payload: { default: true, energy_reward: faseNumber },
      })

      await refetchPlayer()
      setScreen('building_tasks')
    } finally {
      setCompleting(false)
    }
  }

  // AFTER:
  async function handleBuildingTasksDone(bonusPoints: number) {
    const ownedBuildings = playerBuildings
      .map((pb) => pb.building)
      .filter(Boolean) as Building[]

    const productionBuildings = ownedBuildings.filter(
      (b) => !CONDITIONAL_BUILDINGS.includes(b.name)
    )

    const productionPoints = productionBuildings.reduce(
      (sum, b) => sum + (b.points_value ?? 0),
      0
    )

    const p = freshPlayer ?? player
    const newPoints = p.points + productionPoints + bonusPoints

    await supabase
      .from('players')
      .update({
        points: newPoints,
        has_done_resource_phase: true,
      })
      .eq('id', player.id)

    // Check fase update based on new points (fetch all players for max)
    const { data: allPlayers } = await supabase
      .from('players')
      .select('points')
      .eq('room_id', room.id)

    const maxPoints = Math.max(...(allPlayers?.map(pl => pl.points) ?? []), newPoints)
    const newFase = getFaseFromPoints(maxPoints)
    if (newFase !== room.fase) {
      await supabase
        .from('rooms')
        .update({ fase: newFase })
        .eq('id', room.id)

      await supabase.from('room_events').insert({
        room_id: room.id,
        event_type: 'fase_change',
        payload: { fase: newFase },
      })
    }

    await refetchPlayer()
    setScreen('waiting')
    await checkAllDone()
  }

  async function checkAllDone() {
    const { data: allPlayers } = await supabase
      .from('players')
      .select('has_done_resource_phase')
      .eq('room_id', room.id)

    const allDone = allPlayers?.every((p) => p.has_done_resource_phase)
    if (!allDone) return

    await supabase
      .from('rooms')
      .update({ current_phase: 'building' })
      .eq('id', room.id)

    await supabase.from('room_events').insert({
      room_id: room.id,
      event_type: 'phase_change',
      payload: { phase: 'building' },
    })

    onPhaseComplete()
  }

  if (loading) return <LoadingSpinner label="Kaarten uitdelen..." />

  if (screen === 'waiting' || alreadyDone) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <FaseBadge fase={room.fase} />
          <span className={styles.round}>Ronde {room.current_round}</span>
          {opponents.length > 0 && (
            <div className={styles.opponentScores}>
              {opponents.map((op) => (
                <span key={op.id} className={styles.opponentScore}>
                  {op.world_name}: {op.points} pts
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.waiting}>
          <div className={styles.waitIcon}>⏳</div>
          <p className={styles.waitTitle}>Taak voltooid!</p>
          <p className={styles.waitSub}>Wachten op andere spelers...</p>
        </div>
        <div className={styles.footer}>
          <ResourceBar player={currentPlayer} />
        </div>
      </div>
    )
  }

  if (screen === 'building_tasks') {
    return (
      <BuildingTaskScreen
        playerBuildings={playerBuildings}
        player={currentPlayer}
        room={room}
        conditionalBuildings={CONDITIONAL_BUILDINGS}
        onDone={handleBuildingTasksDone}
      />
    )
  }

  const chosenCard = cards.find((c) => c.is_chosen)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FaseBadge fase={room.fase} />
        <span className={styles.round}>Ronde {room.current_round}</span>
        {opponents.length > 0 && (
          <div className={styles.opponentScores}>
            {opponents.map((op) => (
              <span key={op.id} className={styles.opponentScore}>
                {op.world_name}: {op.points} pts
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>Kies een taak</h2>
        <p className={styles.sub}>Voer de taak uit in het echte leven om energie te verdienen</p>

        <TaskCardGrid
          cards={cards}
          onChoose={handleChooseCard}
          chosenId={chosenCard?.id ?? null}
          clothingTaskName={CLOTHING_TASK_NAME}
        />

        <div className={styles.divider}>
          <span>of</span>
        </div>

        <DefaultTaskCard onChoose={handleDefaultTask} loading={completing} faseNumber={faseNumber} />
      </div>

      <div className={styles.footer}>
        <ResourceBar player={currentPlayer} />
      </div>

      {selectedCard && (
        <CompleteTaskModal
          card={selectedCard}
          onComplete={() => handleCompleteTask(selectedCard)}
          onCancel={() => setSelectedCard(null)}
          loading={completing}
          faseNumber={parseInt(selectedCard.task?.fase ?? '1')}
          clothingTaskName={CLOTHING_TASK_NAME}
        />
      )}
    </div>
  )
}