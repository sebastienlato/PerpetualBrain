import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type BadgeTone = 'cyan' | 'gold' | 'rose' | 'slate'

const tones: Record<BadgeTone, string> = {
  cyan: 'gradient-border-soft text-cyan-100',
  gold: 'border-amber-300/28 bg-amber-300/10 text-amber-100 shadow-[0_0_16px_rgba(255,122,61,0.08)]',
  rose: 'border-rose-300/30 bg-rose-300/10 text-rose-100 shadow-[0_0_16px_rgba(255,79,216,0.08)]',
  slate: 'gradient-border-soft text-slate-200',
}

export function Badge({ className, tone = 'slate', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]', tones[tone], className)} {...props} />
}
