import type { ReactNode } from 'react'
import { Card } from './Card'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  )
}
