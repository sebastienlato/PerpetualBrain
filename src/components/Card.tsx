import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'gradient-border-soft glow-panel min-w-0 rounded-lg backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}
