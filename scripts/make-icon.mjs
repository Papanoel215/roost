// Génère roost.ico (multi-tailles) à partir du logo SVG de marque.
// Lancé par : npm run make-icon
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(dir, '..', 'public', 'favicon.svg')
const outPath = path.join(dir, '..', 'roost.ico')

const sizes = [16, 32, 48, 64, 128, 256]
const svg = await readFile(svgPath)

const pngs = await Promise.all(
  sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()),
)

const ico = await pngToIco(pngs)
await writeFile(outPath, ico)
console.log(`✓ roost.ico écrit (${sizes.join(', ')} px) → ${outPath}`)
