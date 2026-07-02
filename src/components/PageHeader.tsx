import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.2)] md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/45 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-white md:text-[2.65rem]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  )
}
