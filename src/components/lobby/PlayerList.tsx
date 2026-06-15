import type { Player } from '../../types'
import styles from './PlayerList.module.css'

interface Props {
  players: Player[]
  currentPlayerId: string
}

const WORLD_EMOJIS = ['🏰', '🌲', '⛰️', '🌊', '🔥', '🌙', '⚡', '🌸']

export function PlayerList({ players, currentPlayerId }: Props) {
  return (
    <div className={styles.list}>
      {players.map((player, i) => (
        <div
          key={player.id}
          className={`${styles.item} ${player.id === currentPlayerId ? styles.mine : ''}`}
        >
          <span className={styles.emoji}>{WORLD_EMOJIS[i % WORLD_EMOJIS.length]}</span>
          <div className={styles.info}>
            <span className={styles.name}>{player.world_name}</span>
            {player.is_host && <span className={styles.hostBadge}>Host</span>}
          </div>
          {player.id === currentPlayerId && (
            <span className={styles.youBadge}>Jij</span>
          )}
        </div>
      ))}
    </div>
  )
}