import { useRoom } from '../hooks/useRoom'
import { usePlayers } from '../hooks/usePlayers'
import { supabase } from '../lib/supabase'
import { PlayerList } from '../components/lobby/PlayerList'
import { StartButton } from '../components/lobby/StartButton'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { useState,useCallback } from 'react'
import styles from './LobbyPage.module.css'
import { useRoomEvents } from '../hooks/useRealtime'

interface Props {
  roomId: string
  playerId: string
  onGameStart: () => void
  onLeave: () => void
}

export function LobbyPage({ roomId, playerId, onGameStart, onLeave }: Props) {
  const { room, loading: roomLoading } = useRoom(roomId)
  const { players, loading: playersLoading } = usePlayers(roomId)
  const [startLoading, setStartLoading] = useState(false)

  const me = players.find((p) => p.id === playerId)
  const isHost = me?.is_host ?? false


  const handleRoomEvent = useCallback((eventType: string) => {
    if (eventType === 'game_started') {
        onGameStart()
    }
    }, [onGameStart])

  useRoomEvents({ roomId, onEvent: handleRoomEvent })

  // Also detect host starting: room stays round 1 but we check a flag — 
  // instead we'll use room.current_phase after host presses start
  // Actually we handle this by checking room_events or we just poll and redirect everyone

  async function handleStart() {
    setStartLoading(true)
    try {
      // Mark game as started by pushing round 1 / resource phase (it's already that, 
      // so we use a dedicated is_started flag — simplest: set current_round to 1 
      // but insert a room_event that other clients detect)
      await supabase.from('room_events').insert({
        room_id: roomId,
        player_id: playerId,
        event_type: 'game_started',
        payload: {},
      })
      onGameStart()
    } catch (e) {
      console.error(e)
    } finally {
      setStartLoading(false)
    }
  }

  if (roomLoading || playersLoading) {
    return <LoadingSpinner label="Lobby laden..." />
  }

  if (!room) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>Kamer niet gevonden.</p>
        <button className={styles.leaveBtn} onClick={onLeave}>Terug</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.leaveBtn} onClick={onLeave}>← Verlaten</button>
        <div className={styles.codeWrapper}>
          <span className={styles.codeLabel}>Kamercode</span>
          <span className={styles.code}>{room.code}</span>
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>Wachten op spelers</h2>
        <p className={styles.hint}>Deel de code met vrienden om samen te spelen</p>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>
            Spelers ({players.length})
          </span>
          <PlayerList players={players} currentPlayerId={playerId} />
        </div>
      </div>

      {isHost && (
        <div className={styles.footer}>
          <StartButton
            playerCount={players.length}
            onStart={handleStart}
            loading={startLoading}
          />
        </div>
      )}

      {!isHost && (
        <div className={styles.footer}>
          <p className={styles.waitMsg}>⏳ Wachten tot de host het spel start...</p>
        </div>
      )}
    </div>
  )
}