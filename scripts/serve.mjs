// Serveur statique autonome (modules Node natifs uniquement).
// Sert le build de production (dist/) et ouvre le navigateur sur l'app.
// Si le serveur tourne déjà, ouvre simplement un onglet puis quitte.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const dir = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(dir, '..', 'dist')
const PORT = 4178
const URL_ = `http://localhost:${PORT}/`

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
}

function openBrowser() {
  if (process.env.ROOST_NO_OPEN) return
  // `start` ouvre l'URL dans le navigateur par défaut (Windows).
  spawn('cmd', ['/c', 'start', '', URL_], { detached: true, stdio: 'ignore' }).unref()
}

if (!existsSync(dist)) {
  console.error("dist/ introuvable — lance d'abord : npm run build")
  process.exit(1)
}

const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, URL_).pathname)
    if (pathname === '/') pathname = '/index.html'

    let file = path.join(dist, pathname)
    // garde-fou : pas de traversée hors de dist/
    if (!file.startsWith(dist)) {
      res.writeHead(403)
      return res.end('Forbidden')
    }

    try {
      const s = await stat(file)
      if (s.isDirectory()) file = path.join(file, 'index.html')
    } catch {
      // fallback SPA : route inconnue → index.html
      file = path.join(dist, 'index.html')
    }

    const data = await readFile(file)
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    // déjà lancé : on ouvre juste un onglet
    openBrowser()
    process.exit(0)
  }
  console.error(e)
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`Roost servi sur ${URL_}`)
  openBrowser()
})
