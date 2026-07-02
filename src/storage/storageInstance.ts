import { getSeedBrainFiles } from '../data/seedBrain'
import { LocalStorageBrainStorage } from './BrainStorage'

export const brainStorage = new LocalStorageBrainStorage(getSeedBrainFiles())
