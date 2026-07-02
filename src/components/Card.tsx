import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.04))] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}
