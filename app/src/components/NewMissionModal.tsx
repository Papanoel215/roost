import { useState } from 'react'
import { AGENTS } from '../data/agents'
import { go } from '../ui/UiContext'
import type { Priority } from '../data/missions'
import { createMission, runMission } from '../lib/runtime'

const AGENT_KEYS = Object.keys(AGENTS)
const PRIORITIES: Priority[] = ['Basse', 'Moyenne', 'Haute']
const WORKSPACES = ['roost/web', 'roost/orchestrator', 'roost/shared']

const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' } as const
const fieldStyle = {
  width: '100%', border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 10,
  padding: '9px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none',
} as const

export default function NewMissionModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [agent, setAgent] = useState('pixie')
  const [workspace, setWorkspace] = useState(WORKSPACES[0])
  const [branch, setBranch] = useState('main')
  const [priority, setPriority] = useState<Priority>('Moyenne')
  const [estimate, setEstimate] = useState<{ cost: string; time: string; tokens: string } | null>(null)

  const engineRate = AGENTS[agent].engine.label.startsWith('Claude Opus') ? 0.05 : AGENTS[agent].engine.label.startsWith('Claude') ? 0.018 : 0.008

  const runEstimate = () => {
    const tokens = Math.min(60000, 6000 + prompt.trim().length * 14)
    const cost = (tokens / 1000) * engineRate
    const seconds = Math.round(45 + tokens / 90)
    setEstimate({
      cost: `${cost.toFixed(2).replace('.', ',')} $`,
      time: seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds} s`,
      tokens: `${(tokens / 1000).toFixed(1).replace('.', ',')}k`,
    })
  }

  const handleLaunch = () => {
    if (!prompt.trim()) return
    const m = createMission({ title: prompt.trim(), agentKey: agent, priority })
    void runMission(m.id)
    onClose()
    go('/missions')
  }

  // workspace and branch are captured in the UI but the runtime does not yet
  // accept them — they are stored as local state for future wiring.
  void workspace
  void branch

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(35,25,18,.34)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '9vh', animation: 'fadein .15s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 560, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 18, boxShadow: '0 20px 60px rgba(40,25,12,.30)', border: '1px solid var(--border)', overflow: 'hidden', animation: 'slidein .2s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="display" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Nouvelle mission</h2>
          <button onClick={onClose} aria-label="Fermer" style={{ marginLeft: 'auto', width: 30, height: 30, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Objectif de la mission</label>
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setEstimate(null) }}
              rows={3}
              placeholder="Ex : refonds la page de connexion pour qu'elle soit responsive et accessible au clavier."
              style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Workspace</label>
              <select value={workspace} onChange={(e) => setWorkspace(e.target.value)} style={fieldStyle}>
                {WORKSPACES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Branche</label>
              <input value={branch} onChange={(e) => setBranch(e.target.value)} style={{ ...fieldStyle, fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Agent</label>
              <select value={agent} onChange={(e) => { setAgent(e.target.value); setEstimate(null) }} style={fieldStyle}>
                {AGENT_KEYS.map((k) => <option key={k} value={k}>{AGENTS[k].name} · {AGENTS[k].role}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priorité</label>
              <div style={{ display: 'flex', background: '#F1EBE2', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 3 }}>
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{ flex: 1, padding: '6px 0', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: priority === p ? '#fff' : 'transparent', color: priority === p ? 'var(--text)' : 'var(--text2)', boxShadow: priority === p ? 'var(--rest)' : 'none' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* estimation pré-vol */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#FFF6F0,#F6FBFA)', border: '1px solid #F2E2D6', borderRadius: 12, padding: '12px 14px' }}>
            {estimate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                <span><strong className="mono" style={{ fontSize: 15 }}>~{estimate.cost}</strong></span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="mono">~{estimate.time}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="mono" style={{ color: 'var(--text2)' }}>~{estimate.tokens} tokens</span>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>Estime le coût et la durée avant de lancer.</span>
            )}
            <button onClick={runEstimate} className="btn" style={{ marginLeft: 'auto', padding: '7px 14px', border: '1px solid var(--ter)', background: 'rgba(224,120,86,.08)', color: 'var(--ter)' }}>
              Estimer
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderTop: '1px solid var(--border)', background: '#FCFAF6' }}>
          <button onClick={onClose} className="btn" style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Annuler</button>
          <button
            onClick={handleLaunch}
            disabled={!prompt.trim()}
            className="btn btn-primary"
            style={{ marginLeft: 'auto', padding: '9px 18px', opacity: prompt.trim() ? 1 : 0.5, cursor: prompt.trim() ? 'pointer' : 'not-allowed' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3l14 9-14 9V3Z" /></svg>
            Lancer la mission
          </button>
        </div>
      </div>
    </div>
  )
}
