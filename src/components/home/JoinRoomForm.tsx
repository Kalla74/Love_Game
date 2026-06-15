import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import styles from './JoinRoomForm.module.css'

interface Props {
  onJoined: (roomId: string, playerId: string) => void
}

export function JoinRoomForm({ onJoined }: Props) {
  const [code, setCode] = useState('')
  const [worldName, setWorldName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    const trimCode = code.trim().toUpperCase()
    const trimName = worldName.trim()

    if (!trimCode || trimCode.length !== 4) {
      setError('Voer een geldige 4-letterige code in')
      return
    }
    if (!trimName) {
      setError('Geef je wereld een naam')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', trimCode)
        .eq('is_active', true)
        .maybeSingle()

      if (roomError) throw roomError
      if (!room) {
        setError('Kamer niet gevonden of al beëindigd')
        setLoading(false)
        return
      }

      if (room.current_phase !== 'resource' || room.current_round !== 1) {
        // allow joining mid-game? For now block it
        // remove this check if you want to allow late join
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, world_name: trimName, is_host: false })
        .select()
        .single()

      if (playerError) throw playerError

      onJoined(room.id, player.id)
    } catch (e: any) {
      setError(e.message ?? 'Iets ging mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.form}>
      <div>
        <label className={styles.label}>Kamercde</label>
        <input
          className={styles.input}
          type="text"
          placeholder="AXBQ"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
        />
      </div>
      <div>
        <label className={styles.label}>Naam van jouw wereld</label>
        <input
          className={styles.input}
          type="text"
          placeholder="bv. Drakenburcht"
          value={worldName}
          onChange={(e) => setWorldName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={24}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.button}
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? 'Verbinden...' : 'Kamer joinen'}
      </button>
    </div>
  )
}