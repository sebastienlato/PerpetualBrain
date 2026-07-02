import { getSeedBrainFiles } from '../data/seedBrain'
import { ApiBrainStorage } from './ApiBrainStorage'
import { LocalStorageBrainStorage } from './BrainStorage'

export const apiBrainStorage = new ApiBrainStorage(window.perpetualBrainDesktop?.apiBaseUrl ?? '')
export const localBrainStorage = new LocalStorageBrainStorage(getSeedBrainFiles())
