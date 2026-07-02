import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { brainStorage } from '../storage/storageInstance'
import type { BrainFile } from '../types/brain'
import { buildProjects } from '../utils/brain'
import { BrainContext } from './brainContext'

export function BrainProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<BrainFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setFiles(await brainStorage.listFiles())
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load brain files.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveFile = useCallback(async (file: BrainFile) => {
    const saved = await brainStorage.saveFile(file)
    setFiles((current) => current.map((item) => (item.id === saved.id ? saved : item)))
  }, [])

  const createFile = useCallback(async (input: Pick<BrainFile, 'path' | 'title' | 'kind' | 'category' | 'content' | 'projectId'>) => {
    const created = await brainStorage.createFile(input)
    setFiles((current) => [...current.filter((item) => item.id !== created.id), created].sort((a, b) => a.path.localeCompare(b.path)))
    return created
  }, [])

  const resetToSeed = useCallback(async () => {
    setFiles(await brainStorage.resetToSeed())
  }, [])

  const projects = useMemo(() => buildProjects(files), [files])

  const value = useMemo(
    () => ({ files, loading, error, projects, saveFile, createFile, resetToSeed }),
    [createFile, error, files, loading, projects, resetToSeed, saveFile],
  )

  return <BrainContext.Provider value={value}>{children}</BrainContext.Provider>
}
