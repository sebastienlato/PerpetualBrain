import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { Card } from './Card'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="gradient-top-line flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <span className="gradient-border-soft grid size-12 place-items-center rounded-lg text-cyan-100">
        <SearchX size={22} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  )
}
