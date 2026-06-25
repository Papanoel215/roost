// Process principal Electron : fenêtre native qui charge le build (dist/),
// sans navigateur ni serveur. Les liens externes s'ouvrent dans le navigateur système.
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('node:path')
const https = require('node:https')

const GITHUB_OWNER = 'Papanoel215'
const GITHUB_REPO = 'roost'

/** Vérifie GitHub releases API et envoie 'update-available' au renderer si une version plus récente existe. */
function checkForUpdates(win) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    headers: { 'User-Agent': 'Roost-App/' + app.getVersion() },
  }
  https.get(options, (res) => {
    let raw = ''
    res.on('data', (chunk) => { raw += chunk })
    res.on('end', () => {
      try {
        const release = JSON.parse(raw)
        const latest = (release.tag_name || '').replace(/^v/, '')
        const current = app.getVersion()
        if (latest && latest !== current && !release.prerelease) {
          const exeAsset = (release.assets || []).find((a) => a.name.endsWith('.exe'))
          win.webContents.send('update-available', {
            version: latest,
            url: exeAsset ? exeAsset.browser_download_url : release.html_url,
            notes: release.body || '',
          })
        }
      } catch { /* réseau ou JSON inattendu — on ignore silencieusement */ }
    })
  }).on('error', () => {})
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#FAF7F2',
    title: 'Roost',
    icon: path.join(__dirname, '..', 'roost.ico'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  const smoke = !!process.env.ROOST_SMOKE

  // affiche la fenêtre une fois prête (évite le flash blanc) — sauf en smoke test
  if (!smoke) win.once('ready-to-show', () => win.show())

  // liens externes (http/https) → navigateur système, jamais dans la fenêtre app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // vérifier les mises à jour 5 s après le chargement
  if (!smoke) {
    win.webContents.once('did-finish-load', () => {
      setTimeout(() => checkForUpdates(win), 5000)
    })
  }

  // smoke test : charge le build puis quitte avec un code de sortie (0 = OK)
  if (smoke) {
    win.webContents.on('did-finish-load', () => app.exit(0))
    win.webContents.on('did-fail-load', (_e, code, desc) => {
      console.error('did-fail-load', code, desc)
      app.exit(1)
    })
    setTimeout(() => app.exit(2), 20000)
  }

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

// ouvrir liens externes depuis le renderer
ipcMain.on('open-external', (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url)
  }
})

app.whenReady().then(() => {
  // identifie l'app pour Windows → icône correcte dans la barre des tâches
  if (process.platform === 'win32') app.setAppUserModelId('studio.roost.app')
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
