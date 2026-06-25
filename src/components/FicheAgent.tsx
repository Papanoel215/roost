import { useState, type ReactNode } from 'react'
import AgentBody from './AgentBody'
import Plumbob from './Plumbob'
import { AGENTS, STATE_CHIP, type AgentDef } from '../data/agents'
import { IconPaintbrush } from './icons'
import ChatPanel from './ChatPanel'
import { useRuns } from '../lib/runtime'

type Tab = 'Activite' | 'Chat' | 'Apercu'

/* ---------- petits éléments ---------- */

const VITAL_ICONS: Record<string, ReactNode> = {
  energy: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  motivation: <path d="M12 3c2 4-1 5-1 8a3 3 0 0 0 6 0c0 5-3 9-5 10-3-1-6-5-6-10 0-3 3-4 6-8Z" />,
  mood: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
  clarity: (
    <>
      <path d="M12 3a4 4 0 0 0-4 4 3.5 3.5 0 0 0-1 6.5A3.5 3.5 0 0 0 12 19a3.5 3.5 0 0 0 5-5.5A3.5 3.5 0 0 0 16 7a4 4 0 0 0-4-4Z" />
      <path d="M12 3v16" />
    </>
  ),
}

function Vital({ kind, label, color, pct }: { kind: string; label: string; color: string; pct: number }) {
  const filled = Math.round((pct / 100) * 12)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 90, fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {VITAL_ICONS[kind]}
        </svg>
        {label}
      </span>
      <div style={{ flex: 1, display: 'flex', gap: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 9, borderRadius: 3, background: i < filled ? color : '#F1EBE2' }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', width: 34, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span
        className="display"
        style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}
      >
        {children}
      </span>
      {right}
    </div>
  )
}

/* ---------- contenu Activité par état ---------- */

function PrimaryBlock({ agent }: { agent: AgentDef }) {
  if (agent.state === 'working') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '11px 13px',
          boxShadow: 'var(--rest)',
          marginBottom: 20,
        }}
      >
        <IconPaintbrush size={16} color="var(--ter)" />
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{agent.task}</span>
        <span style={{ display: 'inline-flex', gap: 3, marginLeft: 'auto' }}>
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text3)', animation: `dot 1.2s infinite ${d}s` }} />
          ))}
        </span>
      </div>
    )
  }

  const map = {
    permission: { bg: '#FFF8EC', border: '#F3DFB4', color: '#A9791C', title: 'En attente de ta permission' },
    blocked: { bg: '#FDF2F1', border: '#F2C9C4', color: '#B83B30', title: 'Run en pause' },
    sleeping: { bg: '#F6F4F0', border: 'var(--border)', color: 'var(--text2)', title: 'Agent endormi' },
  }[agent.state]

  return (
    <div style={{ background: map.bg, border: `1px solid ${map.border}`, borderRadius: 12, padding: '13px 15px', marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: map.color, marginBottom: 6 }}>{map.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: agent.state === 'sleeping' ? 0 : 12 }}>{agent.task}</div>
      {agent.state === 'permission' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ padding: '7px 14px', border: 'none', background: 'var(--ter)', color: '#fff', boxShadow: '0 3px 9px rgba(224,120,86,.3)' }}>Autoriser</button>
          <button className="btn" style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Refuser</button>
        </div>
      )}
      {agent.state === 'blocked' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ padding: '7px 14px', border: 'none', background: 'var(--text)', color: '#fff' }}>Voir le diff</button>
          <button className="btn" style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Relancer</button>
        </div>
      )}
    </div>
  )
}

function fmtDur(ms?: number): string {
  if (!ms) return ''
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

function fmtTok(input?: number, output?: number): string {
  const t = (input ?? 0) + (output ?? 0)
  if (!t) return '—'
  return t >= 1000 ? `${(t / 1000).toFixed(1)}k` : `${t}`
}

/* ---------- le drawer ---------- */

export default function FicheAgent({ agentKey, onClose }: { agentKey: string; onClose: () => void }) {
  const agent = AGENTS[agentKey]
  const [tab, setTab] = useState<Tab>('Activite')
  const runs = useRuns().filter(r => r.agentKey === agentKey).sort((a, b) => b.createdAt - a.createdAt)
  const latestRun = runs[0]
  if (!agent) return null

  const chip = STATE_CHIP[agent.state]
  const tabStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 14px 11px',
    border: 'none',
    background: 'transparent',
    borderBottom: `2.5px solid ${active ? 'var(--ter)' : 'transparent'}`,
    color: active ? 'var(--text)' : 'var(--text3)',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: -1,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
      {/* backdrop : hint flou du studio */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(35,25,18,.34)', backdropFilter: 'blur(3px)', animation: 'fadein .25s ease', cursor: 'pointer' }}
      />

      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100vh',
          width: 468,
          maxWidth: '100%',
          background: 'var(--surface)',
          boxShadow: '-12px 0 40px rgba(40,25,12,.22)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slidein .32s cubic-bezier(.2,.8,.2,1)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* ===== EN-TÊTE ===== */}
        <div style={{ padding: '26px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ position: 'relative', flex: 'none', width: 62 }}>
              <div style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', zIndex: 2 }}>
                <Plumbob variant={agent.plumbob} width={26} height={36} floatDur={3.6} />
              </div>
              <AgentBody
                id={`fiche-${agent.key}`}
                width={62}
                height={78}
                from={agent.avatar.from}
                to={agent.avatar.to}
                face={agent.avatar.face}
                highlight={agent.avatar.highlight}
                blush={agent.avatar.blush}
                shadowRx={28}
                shadowRy={6}
                shadowOpacity={0.12}
              >
                {agent.avatar.accessory}
              </AgentBody>
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                  {agent.name}
                </h1>
                <span className="chip" style={{ padding: '3px 9px', fontSize: 11 }}>
                  <span className="dot" style={{ width: 7, height: 7, background: chip.dot, animation: chip.pulse ? 'pulse-ring 1.8s infinite' : undefined }} />
                  {chip.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>{agent.role}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span style={{ background: agent.engine.bg, border: `1px solid ${agent.engine.border}`, color: agent.engine.color, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                  {agent.engine.label}
                </span>
                <span style={{ background: 'rgba(224,120,86,.1)', color: 'var(--ter)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                  Trait · {agent.trait}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              style={{ flex: 'none', width: 32, height: 32, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn" style={{ flex: 1, justifyContent: 'center', padding: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 5v14M17 5v14" /></svg>
              Pause
            </button>
            <button onClick={() => setTab('Chat')} className="btn" style={{ flex: 1, justifyContent: 'center', padding: 9, border: 'none', background: 'var(--ter)', color: '#fff', boxShadow: '0 3px 9px rgba(224,120,86,.3)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.3 7.3L3 21l1.7-6.7A8 8 0 1 1 21 12Z" /></svg>
              Parler
            </button>
            <button className="btn" title="Promouvoir" style={{ flex: 'none', padding: '9px 11px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 21l-5-2.3 1-5.5-4-3.9 5.5-.8Z" /></svg>
            </button>
            <button className="btn" title="Annuler le run" style={{ flex: 'none', padding: '9px 11px', border: '1px solid #F2C9C4', background: '#FDF2F1', color: 'var(--blocked)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
          </div>

          {/* coût live */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 13, background: '#FBF6EF', border: '1px solid #F1E6D8', borderRadius: 11, padding: '9px 12px', fontSize: 12, color: 'var(--text2)' }}>
            {latestRun ? (
              <>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: latestRun.status === 'running' ? 'var(--teal)' : latestRun.status === 'success' ? 'var(--healthy)' : 'var(--blocked)', animation: latestRun.status === 'running' ? 'spark 1.6s ease-in-out infinite' : undefined }} />
                <span className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>{latestRun.cost ?? '—'}</span>
                {latestRun.status === 'running' ? ' en cours' : ' ce run'}
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="mono">{fmtTok(latestRun.inputTokens, latestRun.outputTokens)}</span> tokens
                {latestRun.durationMs ? <><span style={{ color: 'var(--border)' }}>·</span> {fmtDur(latestRun.durationMs)}</> : null}
                <span style={{ marginLeft: 'auto', color: 'var(--text3)' }}>budget 1,00 $</span>
              </>
            ) : (
              <>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                <span style={{ color: 'var(--text3)' }}>Aucun run — clique Lancer dans les Missions</span>
              </>
            )}
          </div>
        </div>

        {/* ===== ONGLETS ===== */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 16px 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setTab('Activite')} style={tabStyle(tab === 'Activite')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>
            Activité
          </button>
          <button onClick={() => setTab('Chat')} style={tabStyle(tab === 'Chat')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.3 7.3L3 21l1.7-6.7A8 8 0 1 1 21 12Z" /></svg>
            Chat
          </button>
          <button onClick={() => setTab('Apercu')} style={tabStyle(tab === 'Apercu')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></svg>
            Aperçu
          </button>
        </div>

        {/* ===== CONTENU ===== */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#FCFAF6' }}>
          {tab === 'Activite' && (
            <div style={{ padding: '18px 20px 28px' }}>
              <PrimaryBlock agent={agent} />

              <SectionTitle>Vitals</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <Vital kind="energy" label="Énergie" color="var(--vital-energy)" pct={76} />
                <Vital kind="motivation" label="Motivation" color="var(--vital-motivation)" pct={58} />
                <Vital kind="mood" label="Humeur" color="var(--vital-mood)" pct={90} />
                <Vital kind="clarity" label="Clarté" color="var(--vital-clarity)" pct={52} />
              </div>

              {/* Journal des runs — données réelles */}
              {runs.length > 0 && (
                <>
                  <SectionTitle right={
                    latestRun?.status === 'running'
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', animation: 'spark 1.4s infinite' }} />live</span>
                      : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{runs.length} run{runs.length > 1 ? 's' : ''}</span>
                  }>
                    Journal des runs
                  </SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {runs.slice(0, 8).map((r, i, arr) => {
                      const isRunning = r.status === 'running'
                      const isSuccess = r.status === 'success'
                      const bg = isRunning ? 'rgba(60,167,214,.12)' : isSuccess ? 'rgba(61,190,122,.12)' : 'rgba(229,86,75,.12)'
                      const color = isRunning ? 'var(--teal)' : isSuccess ? 'var(--healthy)' : 'var(--blocked)'
                      const timeStr = new Date(r.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={r.id} style={{ display: 'flex', gap: 11, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                            {isRunning ? (
                              <span style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${color}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                            ) : isSuccess ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            )}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{r.title}</div>
                            {r.cost && (
                              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                                <span className="mono">{r.cost}</span>
                                {r.inputTokens || r.outputTokens ? <> · <span className="mono">{fmtTok(r.inputTokens, r.outputTokens)} tokens</span></> : null}
                                {r.durationMs ? <> · {fmtDur(r.durationMs)}</> : null}
                              </div>
                            )}
                            {r.error && <div style={{ fontSize: 11, color: 'var(--blocked)', marginTop: 2 }}>{r.error}</div>}
                          </div>
                          <span className="mono" style={{ flex: 'none', fontSize: 11, color: 'var(--text3)' }}>{timeStr}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {runs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text3)', fontSize: 12, border: '1px dashed var(--border)', borderRadius: 12 }}>
                  Aucun run — lance une mission depuis le Kanban
                </div>
              )}
            </div>
          )}

          {tab === 'Chat' && <ChatPanel agentKey={agent.key} />}

          {tab === 'Apercu' && (
            <div style={{ padding: '18px 20px 28px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--hover)', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', background: '#F4EEE5', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5564B' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F2B23C' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DBE7A' }} />
                  <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--text3)' }}>localhost:3000/</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F0ECE4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#E07856,#2FB3A3)' }} />
                      <span className="display" style={{ fontWeight: 800, fontSize: 15 }}>Acme</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text2)' }}>
                      <span>Produit</span><span>Tarifs</span><span>Docs</span>
                      <span style={{ background: 'var(--ter)', color: '#fff', padding: '5px 12px', borderRadius: 8, fontWeight: 600 }}>Essayer</span>
                    </div>
                  </div>
                  <div style={{ padding: '30px 18px 36px', textAlign: 'center' }}>
                    <div style={{ height: 13, width: '55%', margin: '0 auto 10px', borderRadius: 4, background: '#EFE9E0' }} />
                    <div style={{ height: 13, width: '38%', margin: '0 auto 18px', borderRadius: 4, background: '#EFE9E0' }} />
                    <div style={{ display: 'inline-block', height: 34, width: 130, borderRadius: 9, background: 'linear-gradient(90deg,#F3DFD3,#EFE9E0)', backgroundSize: '300px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 14, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 14, height: 14, border: '2.5px solid var(--ter)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Hot-reload actif · recompilé il y a 3 s
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
