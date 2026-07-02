import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BrainStorage, CreateBrainFileInput, CreateProjectInput } from '../storage/BrainStorage'
import { apiBrainStorage, localBrainStorage } from '../storage/storageInstance'
import type { BrainFile } from '../types/brain'
import { buildProjects } from '../utils/brain'
import { BrainContext, type StorageMode } from './brainContext'

export function BrainProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<BrainFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [storage, setStorage] = useState<BrainStorage>(localBrainStorage)
  const [storageMode, setStorageMode] = useState<StorageMode>('localStorage')
  const [storageMessage, setStorageMessage] = useState('Detecting local file API...')
  const [activeBrainPath, setActiveBrainPath] = useState<string>()

  function fileSystemMessage(health: { brainRootMessage?: string }) {
    return health.brainRootMessage
      ? `File system mode. Markdown files save directly to the active brain folder. ${health.brainRootMessage}`
      : 'File system mode. Markdown files save directly to the active brain folder.'
  }

  const initialize = useCallback(async () => {
    setLoading(true)
    try {
      const health = await apiBrainStorage.health()
      setStorage(apiBrainStorage)
      setStorageMode('api')
      setStorageMessage(fileSystemMessage(health))
      setActiveBrainPath(health.brainRoot)
      setFiles(await apiBrainStorage.listFiles())
      setError(undefined)
    } catch {
      setStorage(localBrainStorage)
      setStorageMode('localStorage')
      setStorageMessage('File persistence unavailable. Running in browser fallback mode. Changes save only to localStorage.')
      setActiveBrainPath('Browser localStorage')
      try {
        setFiles(await localBrainStorage.listFiles())
        setError(undefined)
      } catch (fallbackError) {
        setError(fallbackError instanceof Error ? fallbackError.message : 'Unable to load brain files.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const saveFile = useCallback(async (file: BrainFile) => {
    const saved = await storage.saveFile(file)
    setFiles((current) => current.map((item) => (item.id === saved.id ? saved : item)))
    return saved
  }, [storage])

  const createFile = useCallback(async (input: CreateBrainFileInput) => {
    const created = await storage.createFile(input)
    setFiles((current) => [...current.filter((item) => item.id !== created.id), created].sort((a, b) => a.path.localeCompare(b.path)))
    return created
  }, [storage])

  const createProject = useCallback(async (input: CreateProjectInput) => {
    const result = await storage.createProject(input)
    setFiles((current) => [...current.filter((item) => item.projectId !== result.slug), ...result.files].sort((a, b) => a.path.localeCompare(b.path)))
    return result
  }, [storage])

  const deleteFile = useCallback(async (file: BrainFile) => {
    await storage.deleteFile(file)
    setFiles((current) => current.filter((item) => item.id !== file.id))
  }, [storage])

  const reloadFromSource = useCallback(async () => {
    if (storageMode === 'api') {
      const health = await apiBrainStorage.health()
      setActiveBrainPath(health.brainRoot)
      setStorageMessage(fileSystemMessage(health))
    }
    const nextFiles = await storage.listFiles()
    setFiles(nextFiles)
    return nextFiles
  }, [storage, storageMode])

  const resetToSeed = useCallback(async () => {
    setFiles(await storage.resetToSeed())
  }, [storage])

  const projects = useMemo(() => buildProjects(files), [files])

  const value = useMemo(
    () => ({
      files,
      loading,
      error,
      storageMode,
      storageMessage,
      activeBrainPath,
      projects,
      saveFile,
      createFile,
      createProject,
      deleteFile,
      reloadFromSource,
      resetToSeed,
    }),
    [activeBrainPath, createFile, createProject, deleteFile, error, files, loading, projects, reloadFromSource, resetToSeed, saveFile, storageMessage, storageMode],
  )

  return <BrainContext.Provider value={value}>{children}</BrainContext.Provider>
}
