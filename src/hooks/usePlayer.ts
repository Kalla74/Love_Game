import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '../types'

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (!playerId) return
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setPlayer(data)
    }
    setLoading(false)
  }, [playerId])

  useEffect(() => {
    fetchPlayer()
    const interval = setInterval(fetchPlayer, 3000)
    return () => clearInterval(interval)
  }, [fetchPlayer])

  return { player, loading, error, refetch: fetchPlayer }
}