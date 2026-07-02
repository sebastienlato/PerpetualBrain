import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border-teal-200/50 bg-gradient-to-b from-teal-200 to-teal-300 text-ink-950 shadow-[0_14px_34px_rgba(45,212,191,0.22)] hover:from-teal-100 hover:to-teal-200',
  secondary: 'border-white/12 bg-white/[0.075] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/18 hover:bg-white/[0.12]',
  ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white',
  danger: 'border-rose-300/30 bg-rose-500/12 text-rose-100 hover:border-rose-300/45 hover:bg-rose-500/20',
}

export function Button({ className, variant = 'secondary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold leading-none transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 disabled:opacity-50',
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
