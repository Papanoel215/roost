import { useState } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { useRuns, type Run } from '../lib/runtime'

const ST: Record<Run['status'], { label: string; color: string; bg: string }> = {
  success: { label: 'Réussi', color: 'var(--healthy)', bg: 'rgba(61,190,122,.12)' },
  failed: { label: 'Échec', color: 'var(--blocked)', bg: 'rgba(229,86,75,.12)' },
  running: { label: 'En cours', color: 'var(--tealdeep)', bg: 'rgba(47,179,163,.12)' },
}

function formatDuration(ms: number | undefined): string {
  if (ms == null) return '—'
  const totalSec = Math.round(ms / 1000)
  if (totalSec < 60) return `${totalSec} s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min} min ${sec} s`
}

function formatDate(ts: number): string {
  const d = new Date(ts)
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

export default function RunHistory() {
  const allRuns = useRuns()
  // newest first
  const runs = [...allRuns].sort((a, b) => b.createdAt - a.createdAt)

  const [selId, setSelId] = useState<string | null>(runs[0]?.id ?? null)

  // When a new run appears, auto-select the newest if nothing selected
  const run = runs.find((r) => r.id === selId) ?? runs[0] ?? null

  if (runs.length === 0) {
    return (
      <AppShell active="/runs" title="Historique des runs" subtitle="Aucun run" contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 380 }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Aucun run pour l'instant</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>Lance une mission depuis le board pour voir l'historique s'alimenter.</div>
          <a href="#/missions" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--ter)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
            Aller au board
          </a>
        </div>
      </AppShell>
    )
  }

  const totalTokens = run ? ((run.inputTokens ?? 0) + (run.outputTokens ?? 0)) : 0
  const tokenLabel = totalTokens === 0 ? '—' : totalTokens >= 1000
    ? `${(totalTokens / 1000).toFixed(1).replace('.', ',')}k`
    : String(totalTokens)

  const progressPct = run?.status === 'running' ? '64%' : '100%'

  return (
    <AppShell active="/runs" title="Historique des runs" subtitle={`${runs.length} run${runs.length > 1 ? 's' : ''}`} contentStyle={{ display: 'flex', minHeight: 0 }}>
      {/* liste */}
      <div style={{ width: 360, flex: 'none', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {runs.map((r) => {
          const on = r.id === selId
          const st = ST[r.status]
          return (
            <button key={r.id} onClick={() => setSelId(r.id)} style={{ textAlign: 'left', cursor: 'pointer', borderRadius: 12, padding: '11px 12px', background: on ? 'var(--surface)' : 'transparent', border: `1px solid ${on ? 'var(--ter)' : 'var(--border)'}`, boxShadow: on ? 'var(--rest)' : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MiniAgent agentKey={r.agentKey} size={22} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: st.color, background: st.bg, borderRadius: 999, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                  {r.status === 'running' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, animation: 'spark 1.4s infinite' }} />}
                  {st.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)' }}>
                <span className="mono">{r.cost ?? '—'}</span>
                <span className="mono">{formatDuration(r.durationMs)}</span>
                <span style={{ marginLeft: 'auto' }}>{formatDate(r.createdAt)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* détail */}
      {run && (
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
            <MiniAgent agentKey={run.agentKey} size={30} showDot />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="display" style={{ margin: 0, fontSize: 18, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.title}</h2>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(run.createdAt)}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: ST[run.status].color, background: ST[run.status].bg, borderRadius: 999, padding: '4px 12px', flex: 'none' }}>{ST[run.status].label}</span>
          </div>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {([
              ['Coût', run.cost ?? '—'],
              ['Durée', formatDuration(run.durationMs)],
              ['Tokens', tokenLabel],
              ['Statut', ST[run.status].label],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--rest)' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{k}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* replay scrubber (progress visual) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '11px 14px', marginBottom: 20, boxShadow: 'var(--rest)' }}>
            <div style={{ flex: 'none', width: 32, height: 32, borderRadius: 9, background: 'var(--ter)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px rgba(224,120,86,.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8V4Z" /></svg>
            </div>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#F1EBE2', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: progressPct, borderRadius: 999, background: run.status === 'failed' ? 'var(--blocked)' : 'var(--ter)', transition: 'width .4s ease' }} />
              <div style={{ position: 'absolute', left: progressPct, top: '50%', transform: 'translate(-50%,-50%)', width: 13, height: 13, borderRadius: '50%', background: '#fff', border: `2px solid ${run.status === 'failed' ? 'var(--blocked)' : 'var(--ter)'}` }} />
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{run.status === 'running' ? 'En cours…' : 'Terminé'}</span>
          </div>

          {/* output / error */}
          {(run.output || run.error) && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
                {run.status === 'failed' ? 'Erreur' : 'Résultat'}
              </div>
              <div
                style={{
                  background: run.status === 'failed' ? 'rgba(229,86,75,.05)' : 'var(--surface)',
                  border: `1px solid ${run.status === 'failed' ? 'rgba(229,86,75,.25)' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 420,
                  overflowY: 'auto',
                  boxShadow: 'var(--rest)',
                }}
              >
                {run.status === 'failed' ? run.error : run.output}
              </div>
            </>
          )}

          {run.status === 'running' && !run.output && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--tealdeep)', fontSize: 13, padding: '16px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--tealdeep)', animation: 'spark 1.4s infinite', flex: 'none' }} />
              Exécution en cours — le résultat apparaîtra ici dès la fin du run.
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
