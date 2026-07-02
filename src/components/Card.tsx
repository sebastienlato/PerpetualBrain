import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur',
        className,
      )}
      {...props}
    />
  )
}
