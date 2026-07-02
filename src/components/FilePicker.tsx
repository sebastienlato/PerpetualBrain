import { FileText } from 'lucide-react'
import type { BrainFile } from '../types/brain'
import { Badge } from './Badge'
import { cn } from '../utils/cn'

interface FilePickerProps {
  files: BrainFile[]
  selectedIds: string[]
  onChange(ids: string[]): void
}

export function FilePicker({ files, selectedIds, onChange }: FilePickerProps) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((selected) => selected !== id) : [...selectedIds, id])
  }

  return (
    <div className="grid min-w-0 gap-2 overflow-hidden">
      {files.map((file) => (
        <label
          key={file.id}
          className={cn(
            'flex w-full min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-lg border p-3 text-sm transition duration-200',
            selectedIds.includes(file.id) ? 'border-teal-300/45 bg-teal-300/12 shadow-[0_0_0_1px_rgba(94,234,212,0.08)]' : 'border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.075]',
          )}
        >
          <input className="mt-1 shrink-0 accent-teal-300" type="checkbox" checked={selectedIds.includes(file.id)} onChange={() => toggle(file.id)} />
          <FileText className={cn('mt-0.5 shrink-0', selectedIds.includes(file.id) ? 'text-teal-200' : 'text-slate-400')} size={16} />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="min-w-0 truncate font-medium text-white">{file.title}</span>
              <Badge className="px-2 py-0.5 text-[0.62rem]">{file.kind}</Badge>
            </span>
            <span className="mt-1 block truncate text-xs text-slate-500">{file.path}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
