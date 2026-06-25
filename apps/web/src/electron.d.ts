export {}

declare global {
  interface RoostBridge {
    onUpdateAvailable: (cb: (info: { version: string; url: string; notes?: string }) => void) => void
    openExternal: (url: string) => void
    isElectron: true
  }

  interface Window {
    roostBridge?: RoostBridge
  }
}
