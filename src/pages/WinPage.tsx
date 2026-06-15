import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayers } from '../hooks/usePlayers'
import styles from './WinPage.module.css'

interface Props {
  roomId: string
  onLeave: () => void
}

export function WinPage({ roomId, onLeave }: Props) {
  const { players } = usePlayers(roomId)
  const [winnerId, setWinnerId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWinner() {
      const { data } = await supabase
        .from('room_events')
        .select('player_id')
        .eq('room_id', roomId)
        .eq('event_type', 'game_won')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data?.player_id) setWinnerId(data.player_id)
    }
    fetchWinner()
  }, [roomId])

  const winner = players.find((p) => p.id === winnerId)
  const sorted = [...players].sort((a, b) => b.points - a.points)

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.trophy}>🏆</div>
        <h1 className={styles.title}>
          {winner ? `${winner.world_name} wint!` : 'Spel afgelopen!'}
        </h1>
      </div>

      <div className={styles.leaderboard}>
        {sorted.map((p, i) => (
          <div key={p.id} className={`${styles.row} ${i === 0 ? styles.first : ''}`}>
            <span className={styles.rank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
            <span className={styles.name}>{p.world_name}</span>
            <span className={styles.pts}>{p.points} pts</span>
          </div>
        ))}
      </div>

      <button className={styles.leaveBtn} onClick={onLeave}>
        Terug naar home
      </button>
    </div>
  )
}