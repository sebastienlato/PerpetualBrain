import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function SearchBox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 text-slate-400', className)}>
      <Search size={18} />
      <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" {...props} />
    </label>
  )
}
