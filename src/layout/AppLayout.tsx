import {
  BookOpen,
  Boxes,
  Brain,
  ChevronRight,
  FileStack,
  FolderKanban,
  History,
  LayoutDashboard,
  Library,
  Lightbulb,
  PenTool,
  Settings,
  Sparkles,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useBrain } from '../hooks/useBrain'
import { cn } from '../utils/cn'
import { LoadingState } from '../components/LoadingState'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/global', label: 'Global Brain', icon: Brain },
  { to: '/prompts', label: 'Prompt Library', icon: Library },
  { to: '/context-builder', label: 'Context Builder', icon: Sparkles },
  { to: '/decisions', label: 'Decisions', icon: History },
  { to: '/lessons', label: 'Lessons', icon: Lightbulb },
  { to: '/templates', label: 'Templates', icon: FileStack },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  const { loading, error, files } = useBrain()
  const location = useLocation()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="border-b border-white/10 bg-ink-950/88 px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid size-10 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/12 text-teal-100">
            <BookOpen size={20} />
          </span>
          <span>
            <span className="block text-base font-bold text-white">PerpetualBrain</span>
            <span className="block text-xs text-slate-500">Open Brain for Codex</span>
          </span>
        </NavLink>

        <nav className="mt-5 grid grid-cols-2 gap-1 lg:grid-cols-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'border border-teal-300/20 bg-teal-300/10 text-white'
                    : 'border border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
                )
              }
            >
              <item.icon size={17} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 hidden rounded-lg border border-white/10 bg-white/[0.045] p-3 lg:block">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Boxes size={14} />
            Source
          </div>
          <p className="mt-2 text-sm text-slate-300">{files.length || 0} Markdown files loaded</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Seeded from `/brain`, persisted to browser storage for Phase 1.</p>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 md:px-7 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <PenTool size={14} />
              <span className="truncate">Current workspace: {labelForPath(location.pathname)}</span>
            </div>
            <NavLink to="/search" className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
              Search <ChevronRight size={14} />
            </NavLink>
          </div>

          {loading ? <LoadingState /> : error ? <ErrorPanel message={error} /> : <Outlet />}
        </div>
      </main>
    </div>
  )
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-300/25 bg-rose-400/10 p-5 text-rose-100">
      <h1 className="text-lg font-semibold">Unable to load brain</h1>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

function labelForPath(pathname: string) {
  if (pathname === '/') {
    return 'Dashboard'
  }

  return pathname
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/-/g, ' '))
    .join(' / ')
}
