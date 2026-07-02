import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useBrain } from '../hooks/useBrain'
import { getDecisions } from '../utils/brain'

export function Decisions() {
  const { files, projects } = useBrain()
  const decisions = getDecisions(files, projects)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Decision Log" title="Project decisions with reasons and impact" description="Track durable project decisions so future Codex sessions inherit the why, not just the current code state." />
      {decisions.length === 0 ? (
        <EmptyState title="No decisions yet" body="Add rows to a project DECISIONS.md file to populate the log." />
      ) : (
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <Card key={decision.id} className="gradient-top-line relative overflow-hidden p-5">
              <div className="absolute left-0 top-4 bottom-4 w-px bg-[linear-gradient(180deg,#31c8ff,#7c5cff,#ff4fd8,#ff7a3d)] shadow-[0_0_14px_rgba(255,79,216,0.32)]" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{decision.projectName} / {decision.date}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-snug text-white">{decision.decision}</h2>
                </div>
                <Badge tone={decision.status === 'active' ? 'cyan' : decision.status === 'changed' ? 'gold' : 'rose'}>{decision.status}</Badge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <Info label="Reason" value={decision.reason} />
                <Info label="Impact" value={decision.impact} />
                <Info label="Related files" value={decision.relatedFiles} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="gradient-border-soft rounded-lg p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  )
}
