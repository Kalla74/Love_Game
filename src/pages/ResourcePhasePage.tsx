import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayer } from '../hooks/usePlayer'
import { TaskCardGrid } from '../components/resource/TaskCardGrid'
import { CompleteTaskModal } from '../components/resource/CompleteTaskModal'
import { DefaultTaskCard } from '../components/resource/DefaultTaskCard'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ResourceBar } from '../components/building/ResourceBar'
import { FaseBadge } from '../components/shared/FaseBadge'
import type { Room, Player, RoundTaskCard } from '../types'
import styles from './ResourcePhasePage.module.css'

interface Props {
  room: Room
  player: Player
  onPhaseComplete: () => void
}

export function ResourcePhasePage({ room, player, onPhaseComplete }: Props) {
  const { player: freshPlayer, refetch: refetchPlayer } = usePlayer(player.id)
  const [cards, setCards] = useState<RoundTaskCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<RoundTaskCard | null>(null)
  const [completing, setCompleting] = useState(false)

  const currentPlayer = freshPlayer ?? player
  const alreadyDone = currentPlayer.has_done_resource_phase

  useEffect(() => {
    if (!alreadyDone) {
      dealCards()
    } else {
      setLoading(false)
    }
  }, [player.id, room.current_round, alreadyDone])

  async function dealCards() {
    setLoading(true)

    // Check if cards already dealt this round
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

    // Fetch tasks for current fase
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('fase', room.fase)
      .eq('is_active', true)

    if (!tasks || tasks.length === 0) {
      setLoading(false)
      return
    }

    // Pick 6 random tasks
    const shuffled = [...tasks].sort(() => Math.random() - 0.5).slice(0, 6)

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
    // Mark as chosen
    await supabase
      .from('round_task_cards')
      .update({ is_chosen: true })
      .eq('id', card.id)

    setSelectedCard({ ...card, is_chosen: true })
  }

  async function handleCompleteTask(card: RoundTaskCard) {
    setCompleting(true)
    try {
      const energyReward = card.task?.energy_reward ?? 1

      await supabase
        .from('round_task_cards')
        .update({ is_completed: true })
        .eq('id', card.id)

      await supabase
        .from('players')
        .update({
          energy: currentPlayer.energy + energyReward,
          has_done_resource_phase: true,
        })
        .eq('id', player.id)

      await supabase.from('room_events').insert({
        room_id: room.id,
        player_id: player.id,
        event_type: 'task_completed',
        payload: { card_id: card.id, energy_reward: energyReward },
      })

      setSelectedCard(null)
      refetchPlayer()
      await checkAllDone()
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
          energy: currentPlayer.energy + 1,
          has_done_resource_phase: true,
        })
        .eq('id', player.id)

      await supabase.from('room_events').insert({
        room_id: room.id,
        player_id: player.id,
        event_type: 'task_completed',
        payload: { default: true, energy_reward: 1 },
      })

      refetchPlayer()
      await checkAllDone()
    } finally {
      setCompleting(false)
    }
  }

  async function checkAllDone() {
    const { data: players } = await supabase
      .from('players')
      .select('has_done_resource_phase')
      .eq('room_id', room.id)

    const allDone = players?.every((p) => p.has_done_resource_phase)
    if (!allDone) return

    // Advance to building phase
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

  if (alreadyDone) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <FaseBadge fase={room.fase} />
          <span className={styles.round}>Ronde {room.current_round}</span>
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

  const chosenCard = cards.find((c) => c.is_chosen)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FaseBadge fase={room.fase} />
        <span className={styles.round}>Ronde {room.current_round}</span>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>Kies een taak</h2>
        <p className={styles.sub}>Voer de taak uit in het echte leven om energie te verdienen</p>

        <TaskCardGrid
          cards={cards}
          onChoose={handleChooseCard}
          chosenId={chosenCard?.id ?? null}
        />

        <div className={styles.divider}>
          <span>of</span>
        </div>

        <DefaultTaskCard onChoose={handleDefaultTask} loading={completing} />
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
        />
      )}
    </div>
  )
}