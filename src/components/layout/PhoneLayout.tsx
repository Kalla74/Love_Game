import type { ReactNode } from 'react'
import styles from './PhoneLayout.module.css'

interface Props {
  children: ReactNode
}

export function PhoneLayout({ children }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>{children}</div>
    </div>
  )
}