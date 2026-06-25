import { useState, type DragEvent } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { COLUMNS, PRIORITY_COLOR } from '../data/missions'
import { useMissions, moveMission, deleteMission, runMission, type Mission } from '../lib/runtime'

function Card({
  m,
  onDragStart,
  onDelete,
  onLaunch,
  launching,
}: {
  m: Mission
  onDragStart: (e: DragEvent, id: string) => void
  onDelete: (id: string) => void
  onLaunch: (id: string) => void
  launching: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const canLaunch = m.column === 'Backlog' || m.column === 'En file'

  return (
    <div
      draggable={!launching}
      onDragStart={(e) => onDragStart(e, m.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '11px 12px',
        boxShadow: 'var(--rest)',
        cursor: launching ? 'wait' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        position: 'relative',
        opacity: m.column === 'En cours' && !m.cost ? 0.85 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>{m.title}</span>
        {!hovered && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none', marginTop: 2 }}>
            <circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" />
            <circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
          </svg>
        )}
        {hovered && !launching && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(m.id) }}
            aria-label="Supprimer"
            style={{ flex: 'none', marginTop: 1, width: 18, height: 18, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blocked)', padding: 0 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MiniAgent agentKey={m.agentKey} size={24} showDot />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text2)', background: '#F4ECE2', borderRadius: 999, padding: '2px 8px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLOR[m.priority] }} />
          {m.priority}
        </span>
        {m.cost && <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{m.cost}</span>}
      </div>

      {m.needsReview && (
        <a href="#/revue" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'rgba(242,178,60,.14)', color: '#A9791C', border: '1px solid #F3DFB4', borderRadius: 9, padding: '5px 9px', fontSize: 11, fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 12l2.5 2.5L16 9" /></svg>
          Artefact à réviser
        </a>
      )}

      {/* ▶ Lancer — visible pour Backlog + En file */}
      {canLaunch && (
        <button
          onClick={(e) => { e.stopPropagation(); onLaunch(m.id) }}
          disabled={launching}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 10px', border: 'none', borderRadius: 10, cursor: launching ? 'wait' : 'pointer',
            background: launching ? 'rgba(47,179,163,.12)' : 'linear-gradient(135deg,rgba(47,179,163,.15),rgba(47,179,163,.08))',
            color: 'var(--tealdeep)', fontSize: 12, fontWeight: 700,
            boxShadow: launching ? 'none' : 'inset 0 0 0 1px rgba(47,179,163,.35)',
          }}
        >
          {launching ? (
            <>
              <span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid var(--tealdeep)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              Lancement…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Lancer
            </>
          )}
        </button>
      )}

      {/* indicateur "En cours" sur les missions actives sans coût encore */}
      {m.column === 'En cours' && !m.cost && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--tealdeep)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', animation: 'spark 1.4s ease-in-out infinite' }} />
          En cours · LLM appelé…
        </div>
      )}
    </div>
  )
}

export default function Missions() {
  const missions = useMissions()
  const [overCol, setOverCol] = useState<string | null>(null)
  const [launching, setLaunching] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const onDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDrop = (e: DragEvent, col: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    moveMission(id, col as import('../lib/runtime').Column)
    setOverCol(null)
  }

  const handleLaunch = async (id: string) => {
    setError(null)
    setLaunching((s) => new Set(s).add(id))
    try {
      await runMission(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du lancement')
    } finally {
      setLaunching((s) => { const n = new Set(s); n.delete(id); return n })
    }
  }

  const total = missions.length
  const done = missions.filter((m) => m.column === 'Fait').length

  return (
    <AppShell active="/missions" title="Missions" subtitle={`${total} missions · ${done} terminées`} contentStyle={{ padding: '18px 24px 24px', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* erreur de lancement */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 11, background: '#FDF2F1', border: '1px solid #F2C9C4', color: 'var(--blocked)', fontSize: 13 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--blocked)', fontSize: 13, fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0, alignItems: 'stretch' }}>
        {COLUMNS.map((col) => {
          const items = missions.filter((m) => m.column === col)
          return (
            <div
              key={col}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col) }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={(e) => onDrop(e, col)}
              style={{
                width: 268, flex: 'none', display: 'flex', flexDirection: 'column',
                background: overCol === col ? 'rgba(224,120,86,.06)' : 'transparent',
                border: `1px solid ${overCol === col ? 'var(--ter)' : 'var(--border)'}`,
                borderRadius: 16, padding: 10,
                transition: 'background .15s, border-color .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 12px' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{col}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', background: '#F1EBE2', borderRadius: 999, padding: '1px 8px' }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1, paddingRight: 2 }}>
                {items.map((m) => (
                  <Card
                    key={m.id}
                    m={m}
                    onDragStart={onDragStart}
                    onDelete={deleteMission}
                    onLaunch={handleLaunch}
                    launching={launching.has(m.id)}
                  />
                ))}
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '18px 8px', border: '1px dashed var(--border)', borderRadius: 12 }}>
                    Glisse une carte ici
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
