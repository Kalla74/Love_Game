import type { RoundTaskCard } from '../../types'
import { TaskCard } from './TaskCard'
import styles from './TaskCardGrid.module.css'

interface Props {
  cards: RoundTaskCard[]
  onChoose: (card: RoundTaskCard) => void
  chosenId: string | null
}

export function TaskCardGrid({ cards, onChoose, chosenId }: Props) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <TaskCard
          key={card.id}
          card={card}
          onChoose={onChoose}
          isChosen={card.id === chosenId}
        />
      ))}
    </div>
  )
}