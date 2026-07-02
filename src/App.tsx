import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BrainProvider } from './hooks/BrainProvider'
import { AppLayout } from './layout/AppLayout'
import { ContextBuilder } from './pages/ContextBuilder'
import { Dashboard } from './pages/Dashboard'
import { Decisions } from './pages/Decisions'
import { FileEditor } from './pages/FileEditor'
import { GlobalBrain } from './pages/GlobalBrain'
import { Lessons } from './pages/Lessons'
import { ProjectDetail } from './pages/ProjectDetail'
import { Projects } from './pages/Projects'
import { PromptLibrary } from './pages/PromptLibrary'
import { SearchPage } from './pages/SearchPage'
import { Settings } from './pages/Settings'
import { Templates } from './pages/Templates'

export default function App() {
  return (
    <BrainProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="files/:fileId" element={<FileEditor />} />
            <Route path="global" element={<GlobalBrain />} />
            <Route path="prompts" element={<PromptLibrary />} />
            <Route path="context-builder" element={<ContextBuilder />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="templates" element={<Templates />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BrainProvider>
  )
}
