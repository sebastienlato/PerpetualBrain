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
import { Badge } from '../components/Badge'
import { LoadingState } from '../components/LoadingState'
import { useBrain } from '../hooks/useBrain'
import { cn } from '../utils/cn'

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
  const { loading, error, files, storageMode, storageMessage } = useBrain()
  const location = useLocation()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18.5rem_1fr]">
      <aside className="border-b border-white/10 bg-ink-950/88 px-4 py-4 shadow-[12px_0_50px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <NavLink to="/" className="group flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid size-11 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/12 text-teal-100 shadow-[0_0_32px_rgba(45,212,191,0.14)] transition group-hover:border-teal-200/45">
            <BookOpen size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold tracking-normal text-white">PerpetualBrain</span>
            <span className="block truncate text-xs text-slate-500">Open Brain for Codex</span>
          </span>
        </NavLink>

        <nav className="mt-5 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative flex min-h-10 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition duration-200',
                  isActive
                    ? 'border-teal-300/24 bg-teal-300/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-slate-100',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition', isActive ? 'bg-teal-200' : 'bg-transparent')} />
                  <item.icon className={cn('transition', isActive ? 'text-teal-200' : 'text-slate-500 group-hover:text-slate-300')} size={17} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 hidden rounded-lg border border-white/10 bg-white/[0.045] p-3 lg:block">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Boxes size={14} />
            Source
          </div>
          <p className="mt-2 text-sm text-slate-300">{files.length || 0} Markdown files loaded</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{storageMode === 'api' ? 'Reading and writing Markdown files in /brain.' : 'Using browser localStorage fallback.'}</p>
          <div className="mt-3 flex gap-2">
            <Badge tone={storageMode === 'api' ? 'cyan' : 'gold'}>{storageMode === 'api' ? 'file system' : 'fallback'}</Badge>
            <Badge>markdown</Badge>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 md:px-7 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 grid gap-2">
            {storageMode === 'localStorage' ? (
              <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
                {storageMessage}
              </div>
            ) : null}
            <div className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2.5 text-xs text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <PenTool className="shrink-0 text-teal-200/80" size={14} />
                <span className="truncate">Current workspace: {labelForPath(location.pathname)}</span>
                <Badge className="hidden sm:inline-flex" tone={storageMode === 'api' ? 'cyan' : 'gold'}>{storageMode === 'api' ? 'File system mode' : 'Browser fallback mode'}</Badge>
              </div>
              <NavLink to="/search" className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                Search <ChevronRight size={14} />
              </NavLink>
            </div>
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
