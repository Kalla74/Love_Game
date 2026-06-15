import { useState } from 'react'
import { CreateRoomForm } from '../components/home/CreateRoomForm'
import { JoinRoomForm } from '../components/home/JoinRoomForm'
import styles from './HomePage.module.css'

interface Props {
  onEnterRoom: (roomId: string, playerId: string) => void
}

type Tab = 'create' | 'join'

export function HomePage({ onEnterRoom }: Props) {
  const [tab, setTab] = useState<Tab>('create')

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.icon}>🏰</div>
        <h1 className={styles.title}>World Builders</h1>
        <p className={styles.subtitle}>Bouw je wereld, versla je vrienden</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'create' ? styles.activeTab : ''}`}
            onClick={() => setTab('create')}
          >
            Kamer maken
          </button>
          <button
            className={`${styles.tab} ${tab === 'join' ? styles.activeTab : ''}`}
            onClick={() => setTab('join')}
          >
            Joinen
          </button>
        </div>

        <div className={styles.formArea}>
          {tab === 'create' ? (
            <CreateRoomForm onCreated={onEnterRoom} />
          ) : (
            <JoinRoomForm onJoined={onEnterRoom} />
          )}
        </div>
      </div>
    </div>
  )
}