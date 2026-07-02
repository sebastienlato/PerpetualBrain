import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function SearchBox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('gradient-border-soft gradient-focus flex min-h-12 items-center gap-3 rounded-lg px-4 text-slate-400', className)}>
      <Search className="text-cyan-200/80" size={18} />
      <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" {...props} />
    </label>
  )
}
