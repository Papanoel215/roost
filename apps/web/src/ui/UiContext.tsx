import { createContext, useContext } from 'react'

export interface UiActions {
  openPalette: () => void
  openNewMission: () => void
  pauseAll: () => void
  emergencyStop: () => void
}

export const UiContext = createContext<UiActions>({
  openPalette: () => {},
  openNewMission: () => {},
  pauseAll: () => {},
  emergencyStop: () => {},
})

export const useUi = () => useContext(UiContext)

/** Navigue via le routeur par hash. */
export const go = (route: string) => {
  window.location.hash = route.startsWith('#') ? route : `#${route}`
}
