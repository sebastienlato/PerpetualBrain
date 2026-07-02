import { useContext } from 'react'
import { BrainContext } from './brainContext'

export function useBrain() {
  const context = useContext(BrainContext)
  if (!context) {
    throw new Error('useBrain must be used within BrainProvider')
  }
  return context
}
