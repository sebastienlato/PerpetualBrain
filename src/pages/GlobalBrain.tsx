import { Link } from 'react-router-dom'
import { Globe2 } from 'lucide-react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'

export function GlobalBrain() {
  const { files } = useBrain()
  const globalFiles = files.filter((file) => file.kind === 'global')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Global Brain"
        title="Reusable standards and operating rules"
        description="Shared coding standards, design standards, asset rules, Codex workflow guidance, and prompt library source files."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {globalFiles.map((file) => (
          <Link key={file.id} to={`/files/${file.id}`}>
            <Card className="group h-full p-5 transition hover:shadow-[0_0_22px_rgba(124,92,255,0.1)]">
              <div className="flex items-center gap-3">
                <span className="gradient-border-soft grid size-10 place-items-center rounded-lg text-cyan-200">
                  <Globe2 size={18} />
                </span>
                <h2 className="text-lg font-semibold text-white">{file.title}</h2>
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">{file.content.replace(/^#\s+.+\n*/, '').trim()}</p>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">{file.path}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
