import { IconHeartSearch, IconConstruction, IconSearchAlert } from './icons'
import { AGENTS } from '../data/agents'

const codeStyle = {
  display: 'inline-block',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  background: '#FBF3EE',
  border: '1px solid #F0DECF',
  color: '#9A4E2E',
  padding: '3px 9px',
  borderRadius: 8,
} as const

export default function NeedsAttention() {
  const attention = Object.values(AGENTS).filter(
    (a) => a.state === 'permission' || a.state === 'blocked',
  )

  if (attention.length === 0) return null

  return (
    <section style={{ background: 'linear-gradient(120deg,#FFF6F0 0%,#FFF9F4 60%,#F6FBFA 100%)', border: '1px solid #F2E2D6', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--rest)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
        <IconHeartSearch size={18} color="var(--ter)" stroke={2} />
        <h2 className="display" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
          Qui a besoin de moi&nbsp;?
        </h2>
        <span style={{ background: 'var(--ter)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999 }}>
          {attention.length}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12 }}>Trié par urgence</span>
      </div>

      <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }}>
        {attention.map((agent) => {
          const isPermission = agent.state === 'permission'
          return (
            <div key={agent.key} className="attn-card">
              <div
                className="attn-avatar"
                style={{ background: `radial-gradient(circle at 32% 28%,${agent.avatar.from},${agent.avatar.to})` }}
              >
                {isPermission
                  ? <IconConstruction size={22} color="#fff" stroke={2} />
                  : <IconSearchAlert size={22} color="#fff" stroke={2} />
                }
                <span className="attn-badge" style={{ background: isPermission ? 'var(--attention)' : 'var(--blocked)' }}>
                  {isPermission ? '!' : '×'}
                </span>
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{agent.name}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>· {agent.role} · {agent.engine.label}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: isPermission ? 'rgba(242,178,60,.16)' : 'rgba(229,86,75,.14)',
                    color: isPermission ? '#A9791C' : '#B83B30',
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  }}>
                    ● {isPermission ? 'Permission requise' : 'Bloqué'}
                  </span>
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 6 }}>
                  {isPermission ? 'Demande la permission de lancer :' : agent.task}
                </div>
                {isPermission && agent.taskFile && (
                  <code style={codeStyle}>{agent.taskFile}</code>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 'none' }}>
                {isPermission ? (
                  <>
                    <button className="btn" style={{ padding: '8px 16px', border: 'none', background: 'var(--ter)', color: '#fff', boxShadow: '0 3px 9px rgba(224,120,86,.32)' }}>Autoriser</button>
                    <button className="btn" style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Refuser</button>
                  </>
                ) : (
                  <>
                    <button className="btn" style={{ padding: '8px 16px', border: 'none', background: 'var(--text)', color: '#fff' }}>Voir le diff</button>
                    <button className="btn" style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Relancer</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
