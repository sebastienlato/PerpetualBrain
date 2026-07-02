import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type BadgeTone = 'cyan' | 'gold' | 'rose' | 'slate'

const tones: Record<BadgeTone, string> = {
  cyan: 'border-teal-300/25 bg-teal-300/10 text-teal-100',
  gold: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  rose: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  slate: 'border-slate-300/15 bg-slate-300/8 text-slate-200',
}

export function Badge({ className, tone = 'slate', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn('inline-flex rounded-full border px-2 py-1 text-xs font-medium', tones[tone], className)} {...props} />
}
