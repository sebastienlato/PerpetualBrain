import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="gradient-border glow-panel gradient-top-line relative overflow-hidden rounded-lg p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-white md:text-[2.65rem]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  )
}
