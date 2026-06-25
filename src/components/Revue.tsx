import { useEffect, useState, type ReactNode } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'

type LineType = 'ctx' | 'add' | 'del' | 'hunk'
interface Review {
  id: string
  agent: string
  title: string
  summary: string
  files: { name: string; add: number; del: number }[]
  diff: { t: LineType; text: string }[]
}

const REVIEWS: Review[] = [
  {
    id: 'r1',
    agent: 'pixie',
    title: 'Navbar responsive + menu mobile accessible',
    summary:
      "J'ai extrait un composant Navbar réutilisable et ajouté un menu mobile navigable au clavier (Échap pour fermer, focus piégé). Le logo reste aligné à gauche. Lint vert.",
    files: [
      { name: 'src/components/Navbar.tsx', add: 42, del: 9 },
      { name: 'src/components/Navbar.test.tsx', add: 28, del: 0 },
    ],
    diff: [
      { t: 'hunk', text: '@@ src/components/Navbar.tsx @@' },
      { t: 'ctx', text: "import { useState } from 'react'" },
      { t: 'del', text: 'export function Navbar() {' },
      { t: 'add', text: 'export function Navbar({ items }: NavbarProps) {' },
      { t: 'add', text: '  const [open, setOpen] = useState(false)' },
      { t: 'ctx', text: '  return (' },
      { t: 'add', text: '    <nav aria-label="Principale" className="navbar">' },
      { t: 'del', text: '    <nav className="navbar">' },
      { t: 'ctx', text: '      <Logo />' },
      { t: 'add', text: '      <button aria-expanded={open} onClick={() => setOpen(v => !v)}>' },
      { t: 'add', text: '        <MenuIcon />' },
      { t: 'add', text: '      </button>' },
      { t: 'ctx', text: '    </nav>' },
      { t: 'ctx', text: '  )' },
    ],
  },
  {
    id: 'r2',
    agent: 'probe',
    title: 'Corrige 3 tests cassés (auth.spec.ts)',
    summary:
      "Les tests échouaient à cause d'un mock de session expiré. J'ai mis à jour le fixture et ajouté un cas pour le refresh token. 3/3 verts.",
    files: [{ name: 'tests/auth.spec.ts', add: 17, del: 6 }],
    diff: [
      { t: 'hunk', text: '@@ tests/auth.spec.ts @@' },
      { t: 'del', text: "  const session = { token: 'expired' }" },
      { t: 'add', text: '  const session = makeSession({ ttl: 3600 })' },
      { t: 'ctx', text: "  it('refuse une session expirée', () => {" },
      { t: 'add', text: "  it('rafraîchit le token avant expiration', () => {" },
      { t: 'add', text: '    expect(refresh(session)).resolves.toBeTruthy()' },
      { t: 'ctx', text: '  })' },
    ],
  },
  {
    id: 'r3',
    agent: 'pixie',
    title: 'Extraire un composant Button réutilisable',
    summary:
      "Centralisé les variantes (primaire / secondaire / ghost) dans un seul Button, avec les tokens de marque. Remplacé 6 boutons en dur.",
    files: [
      { name: 'src/components/Button.tsx', add: 31, del: 0 },
      { name: 'src/pages/Home.tsx', add: 4, del: 11 },
    ],
    diff: [
      { t: 'hunk', text: '@@ src/components/Button.tsx @@' },
      { t: 'add', text: 'type Variant = "primary" | "secondary" | "ghost"' },
      { t: 'add', text: 'export function Button({ variant = "primary", ...props }) {' },
      { t: 'add', text: '  return <button className={cx("btn", variant)} {...props} />' },
      { t: 'add', text: '}' },
      { t: 'hunk', text: '@@ src/pages/Home.tsx @@' },
      { t: 'del', text: '<button style={{ background: "#E07856" }}>Essayer</button>' },
      { t: 'add', text: '<Button variant="primary">Essayer</Button>' },
    ],
  },
]

const LINE_STYLE: Record<LineType, React.CSSProperties> = {
  ctx: { color: 'var(--text2)' },
  add: { color: '#1A7468', background: 'rgba(61,190,122,.12)' },
  del: { color: '#B83B30', background: 'rgba(229,86,75,.10)' },
  hunk: { color: 'var(--text3)', background: '#F4ECE2' },
}
const PREFIX: Record<LineType, string> = { ctx: ' ', add: '+', del: '-', hunk: '' }

function Kbd({ children }: { children: ReactNode }) {
  return <kbd>{children}</kbd>
}

export default function Revue() {
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<Record<string, 'approved' | 'rejected'>>({})

  const pending = REVIEWS.filter((r) => !status[r.id])
  const current = REVIEWS[Math.min(idx, REVIEWS.length - 1)]

  const act = (decision: 'approved' | 'rejected') => {
    setStatus((s) => ({ ...s, [current.id]: decision }))
    setIdx((i) => Math.min(i + 1, REVIEWS.length - 1))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'j') setIdx((i) => Math.min(i + 1, REVIEWS.length - 1))
      else if (e.key === 'k') setIdx((i) => Math.max(i - 1, 0))
      else if (e.key === 'a') act('approved')
      else if (e.key === 'r') act('rejected')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <AppShell
      active="/revue"
      title="Revue"
      subtitle={`${pending.length} artefacts en attente · revue groupée`}
      contentStyle={{ display: 'flex', minHeight: 0 }}
    >
      {/* liste */}
      <div style={{ width: 312, flex: 'none', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text3)', padding: '0 4px 4px' }}>
          <span>Naviguer</span>
          <Kbd>j</Kbd><Kbd>k</Kbd>
          <span style={{ marginLeft: 'auto' }}>Approuver</span><Kbd>a</Kbd>
          <span>Rejeter</span><Kbd>r</Kbd>
        </div>
        {REVIEWS.map((r, i) => {
          const st = status[r.id]
          const active = i === idx
          return (
            <button
              key={r.id}
              onClick={() => setIdx(i)}
              style={{
                textAlign: 'left', cursor: 'pointer', borderRadius: 12, padding: '11px 12px',
                background: active ? 'var(--surface)' : 'transparent',
                border: `1px solid ${active ? 'var(--ter)' : 'var(--border)'}`,
                boxShadow: active ? 'var(--rest)' : 'none', opacity: st ? 0.6 : 1,
                display: 'flex', flexDirection: 'column', gap: 7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MiniAgent agentKey={r.agent} size={22} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{r.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{r.files.length} fichier{r.files.length > 1 ? 's' : ''}</span>
                {st && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: st === 'approved' ? 'var(--healthy)' : 'var(--blocked)' }}>
                    {st === 'approved' ? '✓ Approuvé' : '✕ Rejeté'}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* détail diff */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <MiniAgent agentKey={current.agent} size={26} showDot />
            <h2 className="display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{current.title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#FBF6EF', border: '1px solid #F1E6D8', borderRadius: 12, padding: '10px 13px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ter)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
            <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{current.summary}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            {current.files.map((f) => (
              <span key={f.name} className="mono" style={{ fontSize: 12, color: 'var(--text2)', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 9px' }}>
                {f.name}
                <span style={{ color: 'var(--healthy)' }}>+{f.add}</span>
                <span style={{ color: 'var(--blocked)' }}>−{f.del}</span>
              </span>
            ))}
          </div>
        </div>

        {/* diff */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#FCFAF6', padding: '12px 0' }}>
          <pre className="mono" style={{ margin: 0, fontSize: 12.5, lineHeight: '20px' }}>
            {current.diff.map((l, i) => (
              <div key={i} style={{ ...LINE_STYLE[l.t], padding: '0 20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <span style={{ userSelect: 'none', opacity: 0.6, marginRight: 8 }}>{PREFIX[l.t]}</span>
                {l.text}
              </div>
            ))}
          </pre>
        </div>

        {/* actions */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn" style={{ padding: '9px 18px', border: 'none', background: 'var(--healthy)', color: '#fff', boxShadow: '0 3px 9px rgba(61,190,122,.3)' }} onClick={() => act('approved')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
            Approuver <kbd style={{ background: 'rgba(255,255,255,.25)', borderColor: 'transparent', color: '#fff' }}>a</kbd>
          </button>
          <button className="btn" style={{ padding: '9px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }} onClick={() => act('rejected')}>
            Rejeter <kbd>r</kbd>
          </button>
          <button className="btn" style={{ padding: '9px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>
            Demander une reprise
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>{idx + 1} / {REVIEWS.length}</span>
        </div>
      </div>
    </AppShell>
  )
}
