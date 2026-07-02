import { FileText } from 'lucide-react'
import type { BrainFile } from '../types/brain'
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
    <div className="grid gap-2">
      {files.map((file) => (
        <label
          key={file.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-3 text-sm transition',
            selectedIds.includes(file.id) ? 'border-teal-300/40 bg-teal-300/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]',
          )}
        >
          <input className="mt-1 accent-teal-300" type="checkbox" checked={selectedIds.includes(file.id)} onChange={() => toggle(file.id)} />
          <FileText className="mt-0.5 shrink-0 text-slate-400" size={16} />
          <span>
            <span className="block font-medium text-white">{file.title}</span>
            <span className="block text-xs text-slate-500">{file.path}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
