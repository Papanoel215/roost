import { useState } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { useAudit, type AuditEntry } from '../lib/runtime'

type TypeFilter = AuditEntry['type'] | 'all'

const TYPE: Record<AuditEntry['type'], { label: string; color: string; bg: string }> = {
  approval: { label: 'Approbation', color: 'var(--healthy)', bg: 'rgba(61,190,122,.12)' },
  permission: { label: 'Permission', color: '#A9791C', bg: 'rgba(242,178,60,.16)' },
  spend: { label: 'Dépense', color: '#B0791C', bg: 'rgba(242,169,60,.16)' },
  config: { label: 'Config', color: '#2C74A6', bg: 'rgba(60,167,214,.14)' },
  run: { label: 'Run', color: 'var(--tealdeep)', bg: 'rgba(47,179,163,.12)' },
}

const FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'approval', label: 'Approbations' },
  { key: 'permission', label: 'Permissions' },
  { key: 'spend', label: 'Dépenses' },
  { key: 'config', label: 'Config' },
  { key: 'run', label: 'Runs' },
]

// Deterministic gradient for non-agent actors based on first char of name
const HUMAN_COLORS: [string, string][] = [
  ['#8FD9CC', '#2FB3A3'],
  ['#F4C77A', '#E07856'],
  ['#A9C7F4', '#3C6FAE'],
  ['#F4A9CC', '#AE3C6F'],
  ['#C9BFB0', '#A89F92'],
]
function humanGradient(name: string): [string, string] {
  const idx = (name.charCodeAt(0) ?? 0) % HUMAN_COLORS.length
  return HUMAN_COLORS[idx]
}

function formatRelative(at: number): string {
  const diff = Date.now() - at
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `il y a ${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `il y a ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const d = new Date(at)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const hhmm = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Aujourd'hui · ${hhmm}`
  if (isYesterday) return `Hier · ${hhmm}`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ` · ${hhmm}`
}

function exportCSV(entries: AuditEntry[]) {
  const header = ['Acteur', 'Type', 'Action', 'Cible', 'Horodatage']
  const rows = entries.map((e) => [
    e.actor,
    TYPE[e.type].label,
    e.action,
    e.target ?? '',
    new Date(e.at).toISOString(),
  ])
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'audit.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function ActorCell({ entry }: { entry: AuditEntry }) {
  if (entry.actorAgentKey) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <MiniAgent agentKey={entry.actorAgentKey} size={24} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{entry.actor}</span>
      </span>
    )
  }
  const [from, to] = humanGradient(entry.actor)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', background: `radial-gradient(circle at 32% 28%,${from},${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, boxShadow: 'var(--rest)' }}>
        {entry.actor[0]?.toUpperCase() ?? '?'}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{entry.actor}</span>
    </span>
  )
}

export default function Audit() {
  const allEntries = useAudit()
  const [filter, setFilter] = useState<TypeFilter>('all')
  const [q, setQ] = useState('')

  const rows = allEntries
    .filter((e) => filter === 'all' || e.type === filter)
    .filter((e) => {
      if (!q) return true
      const hay = `${e.actor} ${e.action} ${e.target ?? ''}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    })

  const isEmpty = allEntries.length === 0

  return (
    <AppShell active="/audit" title="Journal d'audit" subtitle="Chaque action, horodatée & exportable" contentStyle={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* barre d'outils */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 11px', width: 240 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Acteur, cible…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const on = f.key === filter
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: '6px 12px', background: on ? 'var(--ter)' : 'var(--surface)', border: `1px solid ${on ? 'var(--ter)' : 'var(--border)'}`, color: on ? '#fff' : 'var(--text2)' }}>{f.label}</button>
            )
          })}
        </div>
        <button
          className="btn"
          onClick={() => exportCSV(rows)}
          style={{ marginLeft: 'auto', padding: '8px 14px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          Exporter (CSV)
        </button>
      </div>

      {/* table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Aucune action enregistrée</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>Lance une mission depuis le board pour voir l'audit se remplir.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: '#FCFAF6', zIndex: 1 }}>
                {['Acteur', 'Action', 'Cible', 'Type', 'Horodatage'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 24px', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const t = TYPE[e.type]
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 24px' }}><ActorCell entry={e} /></td>
                    <td style={{ padding: '12px 24px', color: 'var(--text2)' }}>{e.action}</td>
                    <td style={{ padding: '12px 24px' }}>
                      {e.target
                        ? <code className="mono" style={{ fontSize: 12, background: '#FBF3EE', border: '1px solid #F0DECF', color: '#9A4E2E', padding: '2px 7px', borderRadius: 6 }}>{e.target}</code>
                        : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 24px' }}><span style={{ fontSize: 11, fontWeight: 700, color: t.color, background: t.bg, borderRadius: 999, padding: '3px 10px' }}>{t.label}</span></td>
                    <td style={{ padding: '12px 24px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{formatRelative(e.at)}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && !isEmpty && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Aucune entrée pour ce filtre.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  )
}
