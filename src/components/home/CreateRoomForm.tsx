import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { generateRoomCode } from '../../lib/roomCodes'
import styles from './CreateRoomForm.module.css'

interface Props {
  onCreated: (roomId: string, playerId: string) => void
}

export function CreateRoomForm({ onCreated }: Props) {
  const [worldName, setWorldName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    const name = worldName.trim()
    if (!name) {
      setError('Geef je wereld een naam')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let code = generateRoomCode()
      let attempts = 0

      // make sure code is unique
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', code)
          .maybeSingle()

        if (!existing) break
        code = generateRoomCode()
        attempts++
      }

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ code, fase: '1', current_round: 1, current_phase: 'resource' })
        .select()
        .single()

      if (roomError) throw roomError

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, world_name: name, is_host: true })
        .select()
        .single()

      if (playerError) throw playerError

      onCreated(room.id, player.id)
    } catch (e: any) {
      setError(e.message ?? 'Iets ging mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.form}>
      <label className={styles.label}>Naam van jouw wereld</label>
      <input
        className={styles.input}
        type="text"
        placeholder="bv. Elfenrijk"
        value={worldName}
        onChange={(e) => setWorldName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        maxLength={24}
        autoFocus
      />
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.button}
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? 'Aanmaken...' : 'Kamer aanmaken'}
      </button>
    </div>
  )
}