import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border-glow-cyan/40 bg-glow-cyan text-ink-950 shadow-[0_0_24px_rgba(94,234,212,0.2)] hover:bg-teal-200',
  secondary: 'border-white/10 bg-white/[0.07] text-slate-100 hover:bg-white/[0.11]',
  ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white',
  danger: 'border-rose-400/30 bg-rose-500/12 text-rose-100 hover:bg-rose-500/20',
}

export function Button({ className, variant = 'secondary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
