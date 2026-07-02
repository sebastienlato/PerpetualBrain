import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type BadgeTone = 'cyan' | 'gold' | 'rose' | 'slate'

const tones: Record<BadgeTone, string> = {
  cyan: 'border-teal-300/30 bg-teal-300/12 text-teal-100',
  gold: 'border-amber-300/30 bg-amber-300/12 text-amber-100',
  rose: 'border-rose-300/30 bg-rose-300/12 text-rose-100',
  slate: 'border-slate-300/18 bg-slate-300/10 text-slate-200',
}

export function Badge({ className, tone = 'slate', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]', tones[tone], className)} {...props} />
}
