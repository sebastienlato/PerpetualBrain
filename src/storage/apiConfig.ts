const desktop = typeof window !== 'undefined' ? window.perpetualBrainDesktop : undefined

export const API_TOKEN_HEADER = 'X-Perpetual-Brain-Token'

// Empty base URL means same-origin requests, which the Vite dev proxy forwards to the API.
// The packaged desktop app injects an absolute 127.0.0.1 base URL plus a per-launch token.
export const apiBaseUrl = desktop?.apiBaseUrl ?? ''
export const apiAuthToken = desktop?.apiToken

export function apiAuthHeaders(): Record<string, string> {
  return apiAuthToken ? { [API_TOKEN_HEADER]: apiAuthToken } : {}
}
