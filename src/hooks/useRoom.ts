import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Room } from '../types'

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setRoom(data)
    }
    setLoading(false)
  }, [roomId])

  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, 3000)
    return () => clearInterval(interval)
  }, [fetchRoom])

  return { room, loading, error, refetch: fetchRoom }
}