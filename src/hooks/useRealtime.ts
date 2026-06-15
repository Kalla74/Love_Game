import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Options {
  roomId: string
  onEvent: (eventType: string, payload: any) => void
}

export function useRoomEvents({ roomId, onEvent }: Options) {
  const lastSeenAt = useRef<string>(new Date().toISOString())

  useEffect(() => {
    if (!roomId) return

    async function poll() {
      const { data } = await supabase
        .from('room_events')
        .select('*')
        .eq('room_id', roomId)
        .gt('created_at', lastSeenAt.current)
        .order('created_at', { ascending: true })
        .limit(20)

      if (!data || data.length === 0) return

      for (const event of data) {
        lastSeenAt.current = event.created_at
        onEvent(event.event_type, event.payload)
      }
    }

    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [roomId, onEvent])
}