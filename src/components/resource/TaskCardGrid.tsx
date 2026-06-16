import type { RoundTaskCard } from '../../types'
import { TaskCard } from './TaskCard'
import styles from './TaskCardGrid.module.css'

interface Props {
  cards: RoundTaskCard[]
  onChoose: (card: RoundTaskCard) => void
  chosenId: string | null
  clothingTaskName: string  
}

export function TaskCardGrid({ cards, onChoose, chosenId, clothingTaskName }: Props) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => {
        const isClothingTask = card.task?.name
          ?.toLowerCase()
          .includes(clothingTaskName.toLowerCase())
        const taskFase = parseInt(card.task?.fase ?? '1')
        const energyReward = isClothingTask ? taskFase : card.task?.energy_reward

        return (
          <TaskCard
            key={card.id}
            card={card}
            onChoose={onChoose}
            isChosen={card.id === chosenId}
            energyReward={energyReward}
          />
        )
      })}
    </div>
  )
}