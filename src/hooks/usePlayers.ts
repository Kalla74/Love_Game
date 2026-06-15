import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '../types'

export function usePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    if (!roomId) return
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setPlayers(data ?? [])
    }
    setLoading(false)
  }, [roomId])

  useEffect(() => {
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 3000)
    return () => clearInterval(interval)
  }, [fetchPlayers])

  return { players, loading, error, refetch: fetchPlayers }
}