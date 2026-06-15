import { useState, useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { LobbyPage } from './pages/LobbyPage'
import { GamePage } from './pages/GamePage'
import { PhoneLayout } from './components/layout/PhoneLayout'

type Screen = 'home' | 'lobby' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const savedRoomId = sessionStorage.getItem('roomId')
    const savedPlayerId = sessionStorage.getItem('playerId')
    const savedScreen = sessionStorage.getItem('screen') as Screen | null
    if (savedRoomId && savedPlayerId && savedScreen) {
      setRoomId(savedRoomId)
      setPlayerId(savedPlayerId)
      setScreen(savedScreen)
    }
  }, [])

  function handleEnterRoom(roomId: string, playerId: string) {
    setRoomId(roomId)
    setPlayerId(playerId)
    setScreen('lobby')
    sessionStorage.setItem('roomId', roomId)
    sessionStorage.setItem('playerId', playerId)
    sessionStorage.setItem('screen', 'lobby')
  }

  function handleGameStart() {
    setScreen('game')
    sessionStorage.setItem('screen', 'game')
  }

  function handleLeave() {
    setRoomId(null)
    setPlayerId(null)
    setScreen('home')
    sessionStorage.clear()
  }

  return (
    <PhoneLayout>
      {screen === 'home' && (
        <HomePage onEnterRoom={handleEnterRoom} />
      )}
      {screen === 'lobby' && roomId && playerId && (
        <LobbyPage
          roomId={roomId}
          playerId={playerId}
          onGameStart={handleGameStart}
          onLeave={handleLeave}
        />
      )}
      {screen === 'game' && roomId && playerId && (
        <GamePage
          roomId={roomId}
          playerId={playerId}
          onLeave={handleLeave}
        />
      )}
    </PhoneLayout>
  )
}