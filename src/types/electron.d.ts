export {}

declare global {
  interface Window {
    perpetualBrainDesktop?: {
      apiBaseUrl: string
      platform: string
    }
  }
}
