import { useCallback } from 'react'
import { useRoom } from '../hooks/useRoom'
import { usePlayer } from '../hooks/usePlayer'
import { useRoomEvents } from '../hooks/useRealtime'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ResourcePhasePage } from './ResourcePhasePage'
import { BuildingPhasePage } from './BuildingPhasePage'
import { WinPage } from './WinPage'
import styles from './GamePage.module.css'

interface Props {
  roomId: string
  playerId: string
  onLeave: () => void
}

export function GamePage({ roomId, playerId, onLeave }: Props) {
  const { room, loading: roomLoading, refetch: refetchRoom } = useRoom(roomId)
  const { player, loading: playerLoading } = usePlayer(playerId)

  const handleRoomEvent = useCallback((eventType: string) => {
    if (eventType === 'phase_change' || eventType === 'round_advance') {
      refetchRoom()
    }
  }, [refetchRoom])

  useRoomEvents({ roomId, onEvent: handleRoomEvent })

  if (roomLoading || playerLoading) return <LoadingSpinner label="Spel laden..." />
  if (!room || !player) return <LoadingSpinner label="Spel laden..." />

  if (!room.is_active) return <WinPage roomId={roomId} onLeave={onLeave} />

  if (room.current_phase === 'resource') {
    return (
      <ResourcePhasePage
        room={room}
        player={player}
        onPhaseComplete={refetchRoom}
      />
    )
  }

  return (
    <BuildingPhasePage
      room={room}
      player={player}
      onPhaseComplete={refetchRoom}
    />
  )
}