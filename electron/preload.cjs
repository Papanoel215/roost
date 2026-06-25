const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('roostBridge', {
  /** Appelé quand le main détecte une nouvelle version sur GitHub. */
  onUpdateAvailable: (cb) => {
    ipcRenderer.on('update-available', (_event, info) => cb(info))
  },
  /** Ouvre un lien externe dans le navigateur système. */
  openExternal: (url) => {
    ipcRenderer.send('open-external', url)
  },
  /** Retourne true si on tourne dans Electron (pas dans le navigateur). */
  isElectron: true,
})
