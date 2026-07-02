import { FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { SearchBox } from '../components/SearchBox'
import { useBrain } from '../hooks/useBrain'
import { searchBrain } from '../utils/search'

export function SearchPage() {
  const { files } = useBrain()
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchBrain(files, query), [files, query])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Search" title="Command palette search" description="Search across titles, content, tags, paths, projects, decisions, prompts, lessons, and templates." />
      <SearchBox className="mx-auto max-w-4xl" autoFocus placeholder="Search project, tag, prompt, decision, or file path..." value={query} onChange={(event) => setQuery(event.target.value)} />

      {query.trim().length === 0 ? (
        <EmptyState title="Start typing to search" body="Try terms like Phaser, screenshot, Codex, asset, decision, or ShadowSpire." />
      ) : results.length === 0 ? (
        <EmptyState title="No matching brain files" body="Try a broader term or create a new Markdown file for that context." />
      ) : (
        <div className="grid gap-3">
          {results.map((result) => (
            <Link key={result.file.id} to={`/files/${result.file.id}`}>
              <Card className="p-4 transition hover:shadow-[0_0_20px_rgba(124,92,255,0.1)]">
                <div className="flex items-start gap-3">
                  <span className="gradient-border-soft grid size-10 shrink-0 place-items-center rounded-lg text-cyan-200"><FileText size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-white">{result.file.title}</h2>
                      <Badge tone="cyan">{result.matchType}</Badge>
                      <Badge>{result.file.kind}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{result.snippet}</p>
                    <p className="mt-2 text-xs text-slate-500">{result.file.path}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
