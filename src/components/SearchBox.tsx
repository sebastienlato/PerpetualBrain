import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function SearchBox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('flex min-h-12 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-teal-300/35 focus-within:ring-2 focus-within:ring-teal-300/10', className)}>
      <Search className="text-teal-200/80" size={18} />
      <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" {...props} />
    </label>
  )
}
