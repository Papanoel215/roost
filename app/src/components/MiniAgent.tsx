import { AGENTS } from '../data/agents'

const DOT: Record<string, string> = {
  working: 'var(--healthy)',
  permission: 'var(--attention)',
  blocked: 'var(--blocked)',
  sleeping: 'var(--pending)',
}

/** Pastille ronde d'agent (dégradé de classe + initiale) + point d'état optionnel. */
export default function MiniAgent({
  agentKey,
  size = 26,
  showName = false,
  showDot = false,
}: {
  agentKey: string
  size?: number
  showName?: boolean
  showDot?: boolean
}) {
  const a = AGENTS[agentKey]
  if (!a) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
      <span style={{ position: 'relative', flex: 'none' }}>
        <span
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 32% 28%, ${a.avatar.from}, ${a.avatar.to})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: size * 0.42,
            boxShadow: 'var(--rest)',
          }}
        >
          {a.name[0]}
        </span>
        {showDot && (
          <span
            style={{
              position: 'absolute',
              right: -1,
              bottom: -1,
              width: size * 0.34,
              height: size * 0.34,
              borderRadius: '50%',
              background: DOT[a.state],
              border: '2px solid var(--surface)',
            }}
          />
        )}
      </span>
      {showName && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{a.name}</span>
      )}
    </span>
  )
}
