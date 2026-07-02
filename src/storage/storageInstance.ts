import { getSeedBrainFiles } from '../data/seedBrain'
import { ApiBrainStorage } from './ApiBrainStorage'
import { LocalStorageBrainStorage } from './BrainStorage'

export const apiBrainStorage = new ApiBrainStorage()
export const localBrainStorage = new LocalStorageBrainStorage(getSeedBrainFiles())
