import { useState, useEffect, useRef, type ReactNode } from 'react'
import AgentBody from './AgentBody'
import Plumbob from './Plumbob'
import { AGENTS, STATE_CHIP } from '../data/agents'
import ChatPanel from './ChatPanel'
import { useRuns } from '../lib/runtime'

// Guard import for gamification — may not exist in all builds
let useAgentStats: ((key: string) => import('../lib/gamification').AgentStats) | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gam = require('../lib/gamification') as typeof import('../lib/gamification')
  useAgentStats = gam.useAgentStats
} catch {
  useAgentStats = null
}

// ---------------------------------------------------------------------------
// Per-agent hero gradient pairs
// ---------------------------------------------------------------------------

const HERO_GRADIENT: Record<string, [string, string]> = {
  atlas:    ['#2c3e50', '#3498db'],
  pixel:    ['#1a1a2e', '#e94560'],
  probe:    ['#0f3460', '#533483'],
  sentinel: ['#1a1a2e', '#16213e'],
  scribe:   ['#2d1b69', '#11998e'],
  forge:    ['#f7971e', '#ffd200'],
}

// ---------------------------------------------------------------------------
// Achievement catalogue (mirrored for display, no import dependency)
// ---------------------------------------------------------------------------

interface AchDef { id: string; icon: string; title: string; description: string }

const ALL_ACHIEVEMENTS: AchDef[] = [
  { id: 'first_blood',    icon: '🩸', title: 'Premier Sang',      description: 'Effectue ton premier run'              },
  { id: 'serial_runner',  icon: '🏃', title: 'Serial Runner',      description: '10 runs effectués'                    },
  { id: 'century',        icon: '💯', title: 'Centurion',          description: '100 runs effectués'                   },
  { id: 'perfectionist',  icon: '✨', title: 'Perfectionniste',    description: '10 succès consécutifs'                },
  { id: 'night_owl',      icon: '🦉', title: 'Oiseau de Nuit',     description: 'Run effectué après minuit'            },
  { id: 'speedster',      icon: '⚡', title: 'Speedster',          description: 'Run terminé en moins de 5 secondes'  },
  { id: 'marathon',       icon: '🏅', title: 'Marathonien',        description: 'Run de plus de 60 secondes'          },
  { id: 'multi_tasker',   icon: '🔀', title: 'Multi-Tâche',        description: '3 agents actifs simultanément'       },
  { id: 'coin_collector', icon: '🪙', title: 'Collectionneur',     description: '500 coins accumulés'                 },
  { id: 'veteran',        icon: '🎖️', title: 'Vétéran',           description: 'Atteint le niveau 10'                },
  { id: 'elite',          icon: '🏆', title: 'Élite',              description: 'Atteint le niveau 25'                },
  { id: 'legend',         icon: '👑', title: 'Légende',            description: 'Atteint le niveau 50'                },
  { id: 'atlas_fan',      icon: '🗺️', title: "Fan d'Atlas",       description: '10 runs avec Atlas'                  },
  { id: 'pixel_fan',      icon: '🎨', title: 'Fan de Pixel',       description: '10 runs avec Pixel'                  },
  { id: 'probe_fan',      icon: '🔬', title: 'Fan de Probe',       description: '10 runs avec Probe'                  },
  { id: 'sentinel_fan',   icon: '🛡️', title: 'Fan de Sentinel',   description: '10 runs avec Sentinel'               },
  { id: 'scribe_fan',     icon: '📝', title: 'Fan de Scribe',      description: '10 runs avec Scribe'                 },
  { id: 'forge_fan',      icon: '⚒️', title: 'Fan de Forge',       description: '10 runs avec Forge'                  },
  { id: 'big_spender',    icon: '💸', title: 'Grand Dépensier',    description: '1000 coins dépensés'                 },
  { id: 'daily_player',   icon: '📅', title: 'Joueur Quotidien',   description: 'Bonus quotidien réclamé 7 fois'      },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Animated XP / stat bar
// ---------------------------------------------------------------------------

function AnimBar({
  pct,
  color,
  height = 8,
  delay = 0,
  rounded = true,
  glowColor,
}: {
  pct: number
  color: string
  height?: number
  delay?: number
  rounded?: boolean
  glowColor?: string
}) {
  const [filled, setFilled] = useState(0)
  const tid = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    tid.current = setTimeout(() => setFilled(pct), 80 + delay)
    return () => { if (tid.current) clearTimeout(tid.current) }
  }, [pct, delay])

  return (
    <div
      style={{
        flex: 1,
        height,
        borderRadius: rounded ? height : 2,
        background: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${filled}%`,
          background: color,
          borderRadius: rounded ? height : 2,
          transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: glowColor ? `0 0 8px ${glowColor}` : undefined,
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat row (RPG style)
// ---------------------------------------------------------------------------

function StatRow({
  icon,
  label,
  value,
  pct,
  delay,
}: {
  icon: ReactNode
  label: string
  value: string
  pct: number
  delay: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 6, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ width: 90, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, flexShrink: 0 }}>
        {label}
      </span>
      <AnimBar
        pct={pct}
        color="linear-gradient(90deg, #2FB3A3, #6FD79B)"
        height={7}
        delay={delay}
        glowColor="rgba(47,179,163,0.5)"
      />
      <span
        style={{
          fontSize: 12,
          fontFamily: 'monospace',
          color: '#6FD79B',
          fontWeight: 700,
          width: 48,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick stat card
// ---------------------------------------------------------------------------

function QuickCard({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string | number
}) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: '12px 10px',
        textAlign: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Run timeline item
// ---------------------------------------------------------------------------

function RunItem({
  run,
  isFirst,
  isLast,
}: {
  run: { id: string; title: string; status: string; cost?: string; inputTokens?: number; outputTokens?: number; durationMs?: number; createdAt: number; error?: string }
  isFirst: boolean
  isLast: boolean
}) {
  const isRunning = run.status === 'running'
  const isSuccess = run.status === 'success'

  const dotColor = isRunning ? '#3CC6D6' : isSuccess ? '#3DBE7A' : '#E5564B'
  const bgColor  = isRunning ? 'rgba(60,198,214,.15)' : isSuccess ? 'rgba(61,190,122,.15)' : 'rgba(229,86,75,.15)'
  const borderColor = isRunning ? 'rgba(60,198,214,.3)' : isSuccess ? 'rgba(61,190,122,.3)' : 'rgba(229,86,75,.3)'

  const timeStr = new Date(run.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* Timeline vertical line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: bgColor,
            border: `1.5px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dotColor,
            boxShadow: isFirst ? `0 0 12px ${dotColor}44` : undefined,
            flexShrink: 0,
          }}
        >
          {isRunning ? (
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: `2px solid ${dotColor}`,
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
                display: 'block',
              }}
            />
          ) : isSuccess ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 6" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          )}
        </div>
        {!isLast && (
          <div style={{ width: 1, flex: 1, minHeight: 12, background: 'rgba(255,255,255,0.1)', margin: '3px 0' }} />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: isLast ? 0 : 14,
          paddingTop: 2,
          background: isFirst ? 'rgba(255,255,255,0.04)' : undefined,
          borderRadius: isFirst ? 10 : undefined,
          padding: isFirst ? '8px 10px' : '2px 0 14px',
          border: isFirst ? '1px solid rgba(255,255,255,0.08)' : undefined,
          marginBottom: isFirst ? 4 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: isFirst ? 700 : 600, lineHeight: 1.3 }}>
            {run.title}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', flexShrink: 0, marginTop: 1 }}>
            {timeStr}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
          {run.cost && (
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '2px 7px', color: '#F2B23C', fontFamily: 'monospace', fontWeight: 700 }}>
              {run.cost}
            </span>
          )}
          {(run.inputTokens || run.outputTokens) ? (
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 7px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              {fmtTok(run.inputTokens, run.outputTokens)} tok
            </span>
          ) : null}
          {run.durationMs ? (
            <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 7px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              {fmtDur(run.durationMs)}
            </span>
          ) : null}
          {isRunning && (
            <span style={{ fontSize: 10, color: '#3CC6D6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3CC6D6', animation: 'spark 1.4s infinite', display: 'inline-block' }} />
              live
            </span>
          )}
        </div>
        {run.error && (
          <div style={{ fontSize: 11, color: '#F08A82', marginTop: 4, fontFamily: 'monospace' }}>{run.error}</div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Achievement badge
// ---------------------------------------------------------------------------

function Badge({
  def,
  earned,
}: {
  def: AchDef
  earned: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: earned
            ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.15))'
            : 'rgba(255,255,255,0.05)',
          border: earned
            ? '1.5px solid rgba(255,215,0,0.5)'
            : '1.5px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: earned ? 20 : 16,
          filter: earned ? undefined : 'grayscale(1) opacity(0.3)',
          boxShadow: earned ? '0 0 12px rgba(255,215,0,0.25)' : undefined,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          transform: hovered && earned ? 'scale(1.12)' : 'scale(1)',
          cursor: 'default',
        }}
      >
        {def.icon}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20,14,24,0.96)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 8,
            padding: '7px 10px',
            fontSize: 11,
            color: '#fff',
            whiteSpace: 'nowrap',
            zIndex: 200,
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2, color: earned ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>
            {def.title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{def.description}</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Level badge with glow
// ---------------------------------------------------------------------------

function LevelBadge({ level }: { level: number }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        border: '2.5px solid rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 0 18px rgba(255,215,0,0.6), 0 0 36px rgba(255,165,0,0.3)',
        animation: 'level-glow 2.4s ease-in-out infinite',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display, Georgia, serif)',
          fontWeight: 900,
          fontSize: level >= 10 ? 16 : 18,
          color: '#3a2800',
          letterSpacing: -0.5,
        }}
      >
        {level}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type Tab = 'Activite' | 'Chat' | 'Stats'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FicheAgent({ agentKey, onClose }: { agentKey: string; onClose: () => void }) {
  const agent = AGENTS[agentKey]
  const [tab, setTab] = useState<Tab>('Activite')
  const allRuns = useRuns()
  const runs = allRuns.filter((r) => r.agentKey === agentKey).sort((a, b) => b.createdAt - a.createdAt)
  const latestRun = runs[0]

  // Gamification stats (guarded)
  const gamStats = useAgentStats ? useAgentStats(agentKey) : null // eslint-disable-line react-hooks/rules-of-hooks

  if (!agent) return null

  const chip = STATE_CHIP[agent.state]
  const [heroFrom, heroTo] = HERO_GRADIENT[agentKey] ?? ['#1a1a2e', '#3498db']

  // Compute RPG stats from run data
  const totalRuns = runs.length
  const successRuns = runs.filter((r) => r.status === 'success').length
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0

  const allAgentMaxRuns = Math.max(
    1,
    ...Object.keys(AGENTS).map((k) => allRuns.filter((r) => r.agentKey === k).length),
  )
  const activityPct = Math.round((totalRuns / allAgentMaxRuns) * 100)

  const avgDuration = runs.length > 0
    ? runs.reduce((s, r) => s + (r.durationMs ?? 0), 0) / runs.length
    : 0
  // Speed: faster avg = higher pct. Cap at 30s for 100%.
  const speedPct = avgDuration === 0 ? 0 : Math.max(5, Math.min(100, Math.round(100 - (avgDuration / 30000) * 100)))

  // Efficiency: % of runs that had a cost (proxy for "work done")
  const withCost = runs.filter((r) => r.cost).length
  const efficiencyPct = totalRuns > 0 ? Math.round((withCost / totalRuns) * 100) : 0

  // XP / level from gamification store, or derive from runs
  const level = gamStats?.level ?? Math.max(1, Math.floor(Math.sqrt(totalRuns)))
  const xp = gamStats?.xp ?? 0
  const xpToNext = gamStats?.xpToNext ?? 100
  const xpPct = xpToNext > 0 ? Math.round((xp / xpToNext) * 100) : 0
  const coins = gamStats?.coins ?? 0
  const earnedBadgeIds = new Set(gamStats?.badges ?? [])

  // Overlay-style tab buttons
  const tabBtn = (t: Tab, icon: ReactNode, label: string) => {
    const active = tab === t
    return (
      <button
        onClick={() => setTab(t)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          border: 'none',
          borderRadius: 8,
          background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.5)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'background 0.15s ease, color 0.15s ease',
          outline: 'none',
        }}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes fiche-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fiche-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes level-glow {
          0%, 100% { box-shadow: 0 0 18px rgba(255,215,0,.6), 0 0 36px rgba(255,165,0,.3); }
          50%       { box-shadow: 0 0 28px rgba(255,215,0,.9), 0 0 54px rgba(255,165,0,.5); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,6,20,0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fiche-fade-in .25s ease',
            cursor: 'pointer',
          }}
        />

        {/* Panel */}
        <aside
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100vh',
            width: 500,
            maxWidth: '100%',
            background: '#100c1a',
            boxShadow: '-16px 0 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fiche-slide-in .34s cubic-bezier(.2,.8,.2,1)',
            overflow: 'hidden',
          }}
        >
          {/* ===== HERO BANNER ===== */}
          <div
            style={{
              position: 'relative',
              background: `linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 100%)`,
              padding: '24px 20px 0',
              flexShrink: 0,
            }}
          >
            {/* Subtle noise overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 50%)',
                pointerEvents: 'none',
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)',
                zIndex: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Hero content row */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              {/* Agent sprite */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: -18,
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                  }}
                >
                  <Plumbob
                    variant={agent.plumbob}
                    width={28}
                    height={40}
                    floatDur={3.4}
                    sparkDur={1.6}
                  />
                </div>
                <AgentBody
                  id={`fiche-hero-${agent.key}`}
                  width={96}
                  height={120}
                  from={agent.avatar.from}
                  to={agent.avatar.to}
                  face={agent.avatar.face}
                  highlight={agent.avatar.highlight}
                  blush={agent.avatar.blush}
                  shadowRx={34}
                  shadowRy={7}
                  shadowOpacity={0.28}
                >
                  {agent.avatar.accessory}
                </AgentBody>
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 16, paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 26,
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'var(--font-display, Georgia, serif)',
                      letterSpacing: -0.5,
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      lineHeight: 1,
                    }}
                  >
                    {agent.name}
                  </h1>
                  <LevelBadge level={level} />
                </div>

                {/* Specialty + state chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '3px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {agent.role}
                  </span>
                  <span
                    style={{
                      background: agent.engine.bg,
                      border: `1px solid ${agent.engine.border}`,
                      color: agent.engine.color,
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {agent.engine.label}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: chip.dot,
                        animation: chip.pulse ? 'pulse-ring 1.8s infinite' : undefined,
                        flexShrink: 0,
                      }}
                    />
                    {chip.label}
                  </span>
                </div>

                {/* XP bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Expérience
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
                      {xp} / {xpToNext} XP
                    </span>
                  </div>
                  <AnimBar
                    pct={xpPct}
                    color="linear-gradient(90deg, #FFD700, #FFA500)"
                    height={6}
                    glowColor="rgba(255,215,0,0.5)"
                  />
                </div>
              </div>
            </div>

            {/* Tab bar inside hero */}
            <div
              style={{
                display: 'flex',
                gap: 2,
                marginTop: 12,
                position: 'relative',
                zIndex: 2,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: 4,
              }}
            >
              {tabBtn(
                'Activite',
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>,
                'Activité',
              )}
              {tabBtn(
                'Stats',
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="14" width="4" height="8" rx="1" /><rect x="9" y="9" width="4" height="13" rx="1" /><rect x="16" y="4" width="4" height="18" rx="1" /></svg>,
                'Stats & Trophées',
              )}
              {tabBtn(
                'Chat',
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.3 7.3L3 21l1.7-6.7A8 8 0 1 1 21 12Z" /></svg>,
                'Chat',
              )}
            </div>
          </div>

          {/* ===== SCROLLABLE CONTENT ===== */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#130f20' }}>
            {/* ---------- ACTIVITE ---------- */}
            {tab === 'Activite' && (
              <div style={{ padding: '20px 20px 32px' }}>
                {/* Quick stats row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <QuickCard icon="🏃" label="Runs" value={totalRuns} />
                  <QuickCard icon="✅" label="Succès" value={`${successRate}%`} />
                  <QuickCard icon="🪙" label="Coins" value={coins} />
                  <QuickCard icon="⭐" label="Niveau" value={level} />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <a
                    href="#/missions"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: `linear-gradient(90deg, ${heroFrom}, ${heroTo})`,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                    Lancer une mission
                  </a>
                  <button
                    onClick={() => setTab('Chat')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.3 7.3L3 21l1.7-6.7A8 8 0 1 1 21 12Z" /></svg>
                    Parler
                  </button>
                </div>

                {/* Current task highlight */}
                {agent.state !== 'sleeping' && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      marginBottom: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: chip.dot,
                        flexShrink: 0,
                        animation: chip.pulse ? 'pulse-ring 1.8s infinite' : undefined,
                      }}
                    />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>{agent.task}</span>
                    {agent.state === 'working' && (
                      <span style={{ display: 'inline-flex', gap: 3 }}>
                        {[0, 0.2, 0.4].map((d) => (
                          <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `dot 1.2s infinite ${d}s` }} />
                        ))}
                      </span>
                    )}
                  </div>
                )}

                {/* Run Journal */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                      Journal des runs
                    </span>
                    {latestRun?.status === 'running' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#3CC6D6', fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3CC6D6', animation: 'spark 1.4s infinite', display: 'inline-block' }} />
                        live
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {runs.length} run{runs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {runs.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '36px 16px',
                        border: '1px dashed rgba(255,255,255,0.15)',
                        borderRadius: 14,
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>💤</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Aucun run pour l'instant</div>
                      <div style={{ fontSize: 11 }}>Lance une mission depuis le Kanban pour commencer</div>
                    </div>
                  ) : (
                    <div>
                      {runs.slice(0, 8).map((r, i, arr) => (
                        <RunItem
                          key={r.id}
                          run={r}
                          isFirst={i === 0}
                          isLast={i === arr.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------- STATS & TROPHÉES ---------- */}
            {tab === 'Stats' && (
              <div style={{ padding: '20px 20px 32px' }}>
                {/* RPG Stat bars */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                    Attributs de combat
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <StatRow
                      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>}
                      label="Vitesse"
                      value={speedPct === 0 ? '—' : `${speedPct}%`}
                      pct={speedPct}
                      delay={0}
                    />
                    <StatRow
                      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>}
                      label="Précision"
                      value={`${successRate}%`}
                      pct={successRate}
                      delay={80}
                    />
                    <StatRow
                      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>}
                      label="Activité"
                      value={`${activityPct}%`}
                      pct={activityPct}
                      delay={160}
                    />
                    <StatRow
                      icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>}
                      label="Efficacité"
                      value={`${efficiencyPct}%`}
                      pct={efficiencyPct}
                      delay={240}
                    />
                  </div>
                </div>

                {/* Trait badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,165,0,0.1)',
                    border: '1px solid rgba(255,165,0,0.25)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🌟</span>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trait de caractère</div>
                    <div style={{ fontSize: 13, color: '#FFD700', fontWeight: 700 }}>{agent.trait}</div>
                  </div>
                </div>

                {/* Achievements grid */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                      Trophées
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,215,0,0.7)', fontWeight: 600 }}>
                      {earnedBadgeIds.size} / {ALL_ACHIEVEMENTS.length} débloqués
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    {ALL_ACHIEVEMENTS.map((def) => (
                      <Badge
                        key={def.id}
                        def={def}
                        earned={earnedBadgeIds.has(def.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------- CHAT ---------- */}
            {tab === 'Chat' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ChatPanel agentKey={agent.key} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
