import { useState, type ReactNode } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { AGENTS } from '../data/agents'

type Kind = 'Agents' | 'Missions' | 'Runs' | 'Artefacts'
interface Item { kind: Kind; title: string; meta: string; agent?: string; glyph?: ReactNode; href: string }

const ic = (d: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>

const ITEMS: Item[] = [
  ...Object.keys(AGENTS).map((k): Item => ({ kind: 'Agents', title: AGENTS[k].name, meta: `${AGENTS[k].role} · ${AGENTS[k].engine.label}`, agent: k, href: '#/' })),
  { kind: 'Missions', title: 'Refondre la navbar responsive + a11y', meta: 'Pixie · En cours', agent: 'pixie', href: '#/missions' },
  { kind: 'Missions', title: 'Migration de users_table', meta: 'Gizmo · En cours', agent: 'gizmo', href: '#/missions' },
  { kind: 'Missions', title: 'Pipeline CI : cache pnpm', meta: 'Bolt · En file', agent: 'bolt', href: '#/missions' },
  { kind: 'Missions', title: 'Corriger 3 tests cassés', meta: 'Probe · À réviser', agent: 'probe', href: '#/missions' },
  { kind: 'Runs', title: 'Refonte navbar responsive', meta: 'Réussi · 0,18 $ · 2 min 14 s', agent: 'pixie', href: '#/runs' },
  { kind: 'Runs', title: 'Tests auth.spec.ts', meta: 'Échec · 0,09 $', agent: 'probe', href: '#/runs' },
  { kind: 'Runs', title: 'Pipeline CI — cache pnpm', meta: 'Réussi · 0,15 $', agent: 'bolt', href: '#/runs' },
  { kind: 'Artefacts', title: 'Navbar.tsx — PR #214', meta: 'Diff · à réviser', glyph: ic('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6'), href: '#/revue' },
  { kind: 'Artefacts', title: 'Button.tsx', meta: 'Diff · approuvé', glyph: ic('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6'), href: '#/revue' },
  { kind: 'Artefacts', title: 'billing.md', meta: 'Doc · généré', glyph: ic('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6'), href: '#/runs' },
  { kind: 'Artefacts', title: '0042_users.sql', meta: 'Migration · appliquée', glyph: ic('M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3ZM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7'), href: '#/runs' },
]

const KIND_ICON: Record<Kind, ReactNode> = {
  Agents: ic('M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 5.2a3.2 3.2 0 0 1 0 5.6'),
  Missions: ic('M9 6h11M9 12h11M9 18h11M4 6l1 1 1.6-1.6M4 12l1 1 1.6-1.6M4 18l1 1 1.6-1.6'),
  Runs: ic('M12 7v5l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  Artefacts: ic('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6'),
}

const FILTERS: (Kind | 'Tous')[] = ['Tous', 'Agents', 'Missions', 'Runs', 'Artefacts']

export default function GlobalSearch() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<Kind | 'Tous'>('Tous')

  const filtered = ITEMS
    .filter((i) => kind === 'Tous' || i.kind === kind)
    .filter((i) => !q || i.title.toLowerCase().includes(q.toLowerCase()) || i.meta.toLowerCase().includes(q.toLowerCase()))
  const groups: Kind[] = ['Agents', 'Missions', 'Runs', 'Artefacts']

  return (
    <AppShell active="/recherche" title="Recherche" subtitle="Agents · missions · runs · artefacts" contentStyle={{ overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 720, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', boxShadow: 'var(--rest)', marginBottom: 14 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans tout le studio…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-body)' }} />
        </div>

        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const on = f === kind
            return <button key={f} onClick={() => setKind(f)} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: '6px 13px', background: on ? 'var(--ter)' : 'var(--surface)', border: `1px solid ${on ? 'var(--ter)' : 'var(--border)'}`, color: on ? '#fff' : 'var(--text2)' }}>{f}</button>
          })}
        </div>

        {filtered.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Aucun résultat pour « {q} ».</div>}

        {groups.map((g) => {
          const items = filtered.filter((i) => i.kind === g)
          if (items.length === 0) return null
          return (
            <div key={g} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text3)' }}>
                {KIND_ICON[g]}
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>{g}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#F1EBE2', borderRadius: 999, padding: '1px 8px' }}>{items.length}</span>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--rest)', overflow: 'hidden' }}>
                {items.map((i, idx) => (
                  <a key={i.title + idx} href={i.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', color: 'var(--text)', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {i.agent ? <MiniAgent agentKey={i.agent} size={28} /> : <span style={{ width: 28, height: 28, flex: 'none', borderRadius: 8, background: '#F4ECE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>{i.glyph}</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{i.meta}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
