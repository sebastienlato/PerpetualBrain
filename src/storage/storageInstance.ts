import { getSeedBrainFiles } from '../data/seedBrain'
import { apiAuthToken, apiBaseUrl } from './apiConfig'
import { ApiBrainStorage } from './ApiBrainStorage'
import { LocalStorageBrainStorage } from './BrainStorage'

export const apiBrainStorage = new ApiBrainStorage(apiBaseUrl, apiAuthToken)
export const localBrainStorage = new LocalStorageBrainStorage(getSeedBrainFiles())
