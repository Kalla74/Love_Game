import { useRoom } from '../hooks/useRoom'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import styles from './GamePage.module.css'

interface Props {
  roomId: string
  playerId: string
  onLeave: () => void
}

// Placeholder — you'll fill ResourcePhasePage and BuildingPhasePage next
export function GamePage({ roomId, playerId, onLeave }: Props) {
  const { room, loading } = useRoom(roomId)

  if (loading) return <LoadingSpinner label="Spel laden..." />
  if (!room) return <div className={styles.page}><p style={{ color: '#fff', padding: 20 }}>Kamer niet gevonden.</p></div>

  return (
    <div className={styles.page}>
      <p style={{ color: '#fff', padding: 20 }}>
        GamePage — fase {room.fase}, ronde {room.current_round}, fase: {room.current_phase}
      </p>
      <button onClick={onLeave} style={{ margin: 20, color: '#fff', background: 'none', border: '1px solid #fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
        Verlaten
      </button>
    </div>
  )
}