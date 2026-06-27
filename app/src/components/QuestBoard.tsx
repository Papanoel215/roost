import { useState, useEffect, useRef } from 'react'
import MiniAgent from './MiniAgent'
import { useMissions, runMission, type Mission } from '../lib/runtime'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple integer hash from a string — used to seed pseudo-random values per card. */
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function seededInt(seed: number, min: number, max: number): number {
  // LCG one step
  const next = (seed * 1664525 + 1013904223) & 0xffffffff
  return min + (Math.abs(next) % (max - min + 1))
}

const BOSS_KEYWORDS = ['urgent', 'critique', 'critique', 'important', 'bloquant', 'audit', 'sécurité', 'security']

function isBossQuest(title: string): boolean {
  const lower = title.toLowerCase()
  return BOSS_KEYWORDS.some((kw) => lower.includes(kw))
}

// Derive XP reward from priority + boss flag
function xpReward(m: Mission, boss: boolean): number {
  const base = m.priority === 'Haute' ? 120 : m.priority === 'Moyenne' ? 75 : 40
  return boss ? base * 2 : base
}

function coinReward(m: Mission, boss: boolean): number {
  const base = m.priority === 'Haute' ? 30 : m.priority === 'Moyenne' ? 18 : 10
  return boss ? base * 2 : base
}

// Pick 3 daily quests (stable within a calendar day)
function getDailyQuestIds(missions: Mission[]): Set<string> {
  const today = new Date().toISOString().slice(0, 10)
  const daySeed = hashStr(today)
  const available = missions.filter(
    (m) => m.column === 'Backlog' || m.column === 'En file'
  )
  const ids = new Set<string>()
  if (available.length === 0) return ids
  // Shuffle based on seed
  const shuffled = [...available].sort((a, b) =>
    seededInt(hashStr(today + a.id), 0, 1000) - seededInt(hashStr(today + b.id), 0, 1000)
  )
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    ids.add(shuffled[i].id)
  }
  return ids
}

// ---------------------------------------------------------------------------
// Confetti burst (CSS-only via injected keyframes)
// ---------------------------------------------------------------------------

let confettiStyleInjected = false
function ensureConfettiStyle() {
  if (confettiStyleInjected) return
  confettiStyleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes confetti-fall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(90px) rotate(720deg); opacity: 0; }
    }
    @keyframes quest-shimmer {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 1; }
    }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 8px 2px rgba(212,175,55,.35); }
      50%       { box-shadow: 0 0 18px 5px rgba(212,175,55,.65); }
    }
    @keyframes float-scroll {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-6px); }
    }
  `
  document.head.appendChild(style)
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

function ConfettiBurst({ active }: { active: boolean }) {
  const colors = ['#D4AF37', '#F2C94C', '#E07B39', '#4CAF50', '#9B59B6', '#3498DB']
  const pieces: ConfettiPiece[] = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 10 + (i * 6),
    color: colors[i % colors.length],
    delay: i * 40,
    size: 6 + (i % 4),
  }))

  if (!active) return null
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden', height: 120 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 2 === 0 ? '50%' : 2,
            background: p.color,
            animation: `confetti-fall 0.8s ease-out forwards`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Difficulty stars (seeded by mission id)
// ---------------------------------------------------------------------------

function DifficultyStars({ missionId, priority }: { missionId: string; priority: string }) {
  const seed = hashStr(missionId)
  const base = priority === 'Haute' ? 3 : priority === 'Moyenne' ? 2 : 1
  const stars = Math.min(5, base + seededInt(seed, 0, 1))

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < stars ? '#D4AF37' : 'rgba(212,175,55,.2)'} aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quest card
// ---------------------------------------------------------------------------

interface QuestCardProps {
  m: Mission
  isDaily: boolean
  isBoss: boolean
  launching: boolean
  justDone: boolean
  onLaunch: (id: string) => void
}

function QuestCard({ m, isDaily, isBoss, launching, justDone, onLaunch }: QuestCardProps) {
  const isAvailable = m.column === 'Backlog' || m.column === 'En file'
  const isActive    = m.column === 'En cours'
  const isDone      = m.column === 'Fait' || m.column === 'À réviser'

  const xp    = xpReward(m, isBoss)
  const coins = coinReward(m, isBoss)

  // Card background: parchment feel in each zone colour
  const cardBg = isDone
    ? 'linear-gradient(145deg, #1a2a1a 0%, #1e2e1e 100%)'
    : isActive
    ? 'linear-gradient(145deg, #0d1a2e 0%, #112040 100%)'
    : 'linear-gradient(145deg, #2a1e10 0%, #332513 100%)'

  const borderColor = isBoss
    ? '#D4AF37'
    : isDone
    ? '#2d6e2d'
    : isActive
    ? '#2a6fa8'
    : '#8B6914'

  const glowColor = isBoss
    ? 'rgba(212,175,55,.25)'
    : isDone
    ? 'rgba(45,110,45,.25)'
    : isActive
    ? 'rgba(42,111,168,.25)'
    : 'rgba(139,105,20,.15)'

  return (
    <div
      style={{
        position: 'relative',
        background: cardBg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: '13px 14px',
        boxShadow: `0 4px 16px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 1px ${glowColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'transform .15s, box-shadow .15s',
        animation: isBoss ? 'pulse-gold 2.5s ease-in-out infinite' : undefined,
      }}
    >
      <ConfettiBurst active={justDone} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Boss badge */}
        {isBoss && (
          <span style={{
            flex: 'none', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#D4AF37', background: 'rgba(212,175,55,.12)',
            border: '1px solid rgba(212,175,55,.4)', borderRadius: 4, padding: '2px 6px',
          }}>
            Boss
          </span>
        )}
        {isDaily && (
          <span style={{
            flex: 'none', fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: '#F2C94C', background: 'rgba(242,201,76,.1)',
            border: '1px solid rgba(242,201,76,.35)', borderRadius: 4, padding: '2px 6px',
          }}>
            ⚡ Quête du jour
          </span>
        )}
      </div>

      {/* Title */}
      <p style={{
        margin: 0,
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.4,
        color: isDone ? '#6db86d' : isActive ? '#78b4e0' : '#E8D5A3',
        fontFamily: 'Georgia, "Times New Roman", serif',
        textShadow: '0 1px 2px rgba(0,0,0,.6)',
      }}>
        {isDone && (
          <svg style={{ marginRight: 5, verticalAlign: 'middle' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6db86d" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {m.title}
      </p>

      {/* Difficulty + agent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <MiniAgent agentKey={m.agentKey} size={22} showDot />
        <DifficultyStars missionId={m.id} priority={m.priority} />
      </div>

      {/* Rewards row */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <RewardBadge icon="✨" value={`${xp} XP`} color="#b8a0e8" bg="rgba(184,160,232,.1)" border="rgba(184,160,232,.3)" />
        <RewardBadge icon="🪙" value={`${coins}`} color="#D4AF37" bg="rgba(212,175,55,.1)" border="rgba(212,175,55,.3)" />
        {m.cost && (
          <RewardBadge icon="💸" value={m.cost} color="#a0c8a0" bg="rgba(160,200,160,.08)" border="rgba(160,200,160,.25)" />
        )}
      </div>

      {/* Active spinner */}
      {isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#78b4e0' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            border: '2px solid #78b4e0', borderTopColor: 'transparent',
            animation: 'spin-slow .9s linear infinite',
            display: 'inline-block',
          }} />
          Mission en cours…
        </div>
      )}

      {/* Launch button */}
      {isAvailable && (
        <button
          onClick={() => onLaunch(m.id)}
          disabled={launching}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '8px 12px',
            border: 'none', borderRadius: 8, cursor: launching ? 'wait' : 'pointer',
            background: launching
              ? 'rgba(212,175,55,.08)'
              : 'linear-gradient(135deg, rgba(212,175,55,.22) 0%, rgba(212,175,55,.12) 100%)',
            color: '#D4AF37',
            fontSize: 12, fontWeight: 800,
            boxShadow: launching ? 'none' : 'inset 0 0 0 1px rgba(212,175,55,.4)',
            letterSpacing: '0.04em',
            fontFamily: 'Georgia, serif',
            transition: 'background .15s',
          }}
        >
          {launching ? (
            <>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                border: '2px solid #D4AF37', borderTopColor: 'transparent',
                animation: 'spin-slow .9s linear infinite', display: 'inline-block',
              }} />
              Lancement…
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Lancer la quête →
            </>
          )}
        </button>
      )}
    </div>
  )
}

function RewardBadge({ icon, value, color, bg, border }: { icon: string; value: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, color,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 999, padding: '2px 8px',
    }}>
      {icon} {value}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

function QuestColumn({
  title,
  subtitle,
  missions,
  dailyIds,
  launching,
  justDoneIds,
  onLaunch,
  accent,
}: {
  title: string
  subtitle: string
  missions: Mission[]
  dailyIds: Set<string>
  launching: Set<string>
  justDoneIds: Set<string>
  onLaunch: (id: string) => void
  accent: string
}) {
  return (
    <div style={{
      flex: 1, minWidth: 270, maxWidth: 380,
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)',
      border: `1px solid rgba(255,255,255,.08)`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '14px 16px 12px',
        background: 'rgba(0,0,0,.25)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: accent,
          boxShadow: `0 0 8px ${accent}`,
        }} />
        <span style={{ fontWeight: 800, fontSize: 13, color: '#E8D5A3', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11, fontWeight: 700, color: 'rgba(232,213,163,.5)',
          background: 'rgba(255,255,255,.06)', borderRadius: 999, padding: '2px 8px',
        }}>
          {missions.length}
        </span>
      </div>
      <p style={{ margin: '6px 16px 0', fontSize: 10, color: 'rgba(232,213,163,.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {subtitle}
      </p>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missions.length === 0 ? (
          <EmptySlot />
        ) : (
          missions.map((m) => (
            <QuestCard
              key={m.id}
              m={m}
              isDaily={dailyIds.has(m.id)}
              isBoss={isBossQuest(m.title)}
              launching={launching.has(m.id)}
              justDone={justDoneIds.has(m.id)}
              onLaunch={onLaunch}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptySlot() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '32px 16px',
      color: 'rgba(232,213,163,.3)',
      textAlign: 'center',
    }}>
      {/* Scroll illustration */}
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" style={{ animation: 'float-scroll 3s ease-in-out infinite' }}>
        <rect x="6" y="8" width="30" height="26" rx="4" fill="rgba(232,213,163,.07)" stroke="rgba(232,213,163,.2)" strokeWidth="1.5" />
        <path d="M6 14c0-3.3 2.7-6 6-6s6 2.7 6 6v18c0 3.3-2.7 6-6 6S6 35.3 6 32" stroke="rgba(232,213,163,.2)" strokeWidth="1.5" fill="none" />
        <line x1="18" y1="16" x2="30" y2="16" stroke="rgba(232,213,163,.15)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="21" x2="30" y2="21" stroke="rgba(232,213,163,.15)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="26" x2="26" y2="26" stroke="rgba(232,213,163,.15)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, fontFamily: 'Georgia, serif' }}>Pas de quêtes ici</p>
        <p style={{ margin: '4px 0 0', fontSize: 11 }}>Le tableau attend de nouveaux héros…</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gold divider with title
// ---------------------------------------------------------------------------

function GoldDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px', marginBottom: 14 }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.4), transparent)' }} />
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'rgba(212,175,55,.7)',
        fontFamily: 'Georgia, serif',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.4), transparent)' }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main QuestBoard component
// ---------------------------------------------------------------------------

export default function QuestBoard({
  launching,
  onLaunch,
}: {
  launching: Set<string>
  onLaunch: (id: string) => void
}) {
  const missions     = useMissions()
  const dailyIds     = getDailyQuestIds(missions)
  const [justDoneIds, setJustDoneIds] = useState<Set<string>>(new Set())
  const prevColumnsRef = useRef<Record<string, string>>({})

  // Detect missions that just moved to Fait / À réviser for confetti
  useEffect(() => {
    ensureConfettiStyle()
    const prev = prevColumnsRef.current
    const newDone = new Set<string>()
    missions.forEach((m) => {
      if ((m.column === 'Fait' || m.column === 'À réviser') && prev[m.id] && prev[m.id] !== 'Fait' && prev[m.id] !== 'À réviser') {
        newDone.add(m.id)
      }
    })
    if (newDone.size > 0) {
      setJustDoneIds(newDone)
      const timeout = setTimeout(() => setJustDoneIds(new Set()), 1200)
      // update prev
      const next: Record<string, string> = {}
      missions.forEach((m) => { next[m.id] = m.column })
      prevColumnsRef.current = next
      return () => clearTimeout(timeout)
    }
    const next: Record<string, string> = {}
    missions.forEach((m) => { next[m.id] = m.column })
    prevColumnsRef.current = next
  }, [missions])

  const available  = missions.filter((m) => m.column === 'Backlog' || m.column === 'En file')
  const active     = missions.filter((m) => m.column === 'En cours')
  const accomplished = missions.filter((m) => m.column === 'Fait' || m.column === 'À réviser')

  const totalXp    = missions.reduce((acc, m) => acc + xpReward(m, isBossQuest(m.title)), 0)
  const doneCount  = accomplished.length
  const bossCount  = missions.filter((m) => isBossQuest(m.title)).length

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: 'linear-gradient(160deg, #0d0a06 0%, #120e08 40%, #0a0d12 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }} />

      {/* Gold frame lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F2C94C 50%, #D4AF37 80%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,.4) 50%, transparent 100%)' }} />

      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid rgba(212,175,55,.18)',
        background: 'rgba(0,0,0,.35)',
        position: 'relative',
        zIndex: 1,
      }}>
        <GoldDivider label="Tableau des Quêtes" />
        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <StatChip icon="⚔️" label="Quêtes dispo" value={available.length} />
          <StatChip icon="🔥" label="En mission" value={active.length} />
          <StatChip icon="🏆" label="Accomplies" value={doneCount} />
          <StatChip icon="👹" label="Boss quêtes" value={bossCount} />
          <StatChip icon="✨" label="XP disponible" value={totalXp} />
        </div>
      </div>

      {/* Board columns */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', gap: 16,
        padding: '18px 20px 20px',
        overflowX: 'auto',
        overflowY: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        <QuestColumn
          title="Quêtes disponibles"
          subtitle="Prends une quête et pars à l'aventure"
          missions={available}
          dailyIds={dailyIds}
          launching={launching}
          justDoneIds={justDoneIds}
          onLaunch={onLaunch}
          accent="#D4AF37"
        />
        <QuestColumn
          title="En mission"
          subtitle="Les héros sont au combat"
          missions={active}
          dailyIds={dailyIds}
          launching={launching}
          justDoneIds={justDoneIds}
          onLaunch={onLaunch}
          accent="#3a8fd4"
        />
        <QuestColumn
          title="Accomplies"
          subtitle="Gloire et XP récoltées"
          missions={accomplished}
          dailyIds={dailyIds}
          launching={launching}
          justDoneIds={justDoneIds}
          onLaunch={onLaunch}
          accent="#4CAF50"
        />
      </div>
    </div>
  )
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(232,213,163,.4)', fontFamily: 'Georgia, serif' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 800, color: '#D4AF37', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}
