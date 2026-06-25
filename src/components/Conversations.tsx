import { useState } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { AGENTS } from '../data/agents'
import { useConversations } from '../lib/store'

export default function Conversations() {
  const convos = useConversations()
  const [selId, setSelId] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const filtered = convos.filter((c) => {
    if (!q) return true
    const agent = AGENTS[c.agentKey]
    return (
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      agent?.name.toLowerCase().includes(q.toLowerCase())
    )
  })

  const sel = convos.find((c) => c.id === selId) ?? filtered[0] ?? null

  const fmtDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = diffMs / 3_600_000
    if (diffH < 24 && d.getDate() === now.getDate()) {
      return 'Auj. · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    if (diffH < 48) return 'Hier · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <AppShell active="/conversations" title="Conversations" subtitle="Historique de chat · reprise" contentStyle={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px 12px' }}>
            <h2 className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Conversations</h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              style={{ width: '100%', padding: '8px 11px', borderRadius: 10, border: '1px solid var(--border)', background: '#FBF6EF', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                {convos.length === 0
                  ? 'Aucune conversation — ouvre la fiche d\'un agent pour démarrer.'
                  : 'Aucun résultat.'}
              </div>
            )}
            {filtered.map((c) => {
              const agent = AGENTS[c.agentKey]
              const isActive = (sel?.id === c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => setSelId(c.id)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', border: 'none', cursor: 'pointer',
                    background: isActive ? 'rgba(224,120,86,.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--ter)' : '3px solid transparent',
                  }}
                >
                  {agent ? (
                    <MiniAgent agentKey={c.agentKey} size={34} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--border)' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {agent?.name ?? c.agentKey} · {fmtDate(c.updatedAt)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!sel ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              Sélectionne une conversation.
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {AGENTS[sel.agentKey] && <MiniAgent agentKey={sel.agentKey} size={36} />}
                <div>
                  <div className="display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{sel.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {AGENTS[sel.agentKey]?.name ?? sel.agentKey} · {fmtDate(sel.updatedAt)} · {sel.messages.length} messages
                  </div>
                </div>
                <a
                  href={`#/`}
                  style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ter)', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--ter)', background: 'rgba(224,120,86,.06)' }}
                  title="Ouvrir la fiche de l'agent"
                >
                  Ouvrir →
                </a>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sel.messages.map((m, i) =>
                  m.role === 'user' ? (
                    <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '76%', background: 'var(--ter)', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', boxShadow: '0 3px 9px rgba(224,120,86,.2)' }}>
                      {m.content}
                    </div>
                  ) : (
                    <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '82%', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--text)', whiteSpace: 'pre-wrap', boxShadow: 'var(--rest)' }}>
                      {m.content}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
