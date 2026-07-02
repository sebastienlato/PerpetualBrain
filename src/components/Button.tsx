import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'gradient-border-strong text-white shadow-[0_16px_42px_rgba(0,0,0,0.34)] hover:shadow-[0_0_18px_rgba(49,200,255,0.14),0_0_26px_rgba(255,79,216,0.12)]',
  secondary: 'gradient-border-soft text-slate-100 hover:text-white hover:shadow-[0_0_18px_rgba(124,92,255,0.12)]',
  ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white',
  danger: 'border-rose-300/30 bg-rose-500/12 text-rose-100 hover:border-rose-300/45 hover:bg-rose-500/20',
}

export function Button({ className, variant = 'secondary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold leading-none transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c5cff] disabled:opacity-50',
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
