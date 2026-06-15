import styles from './LoadingSpinner.module.css'

interface Props {
  label?: string
}

export function LoadingSpinner({ label = 'Laden...' }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.label}>{label}</p>
    </div>
  )
}