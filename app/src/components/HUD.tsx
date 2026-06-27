import { useEffect, useRef, useState } from 'react'
import { useGamification, claimDailyBonus } from '../lib/gamification'
import { playSound } from '../lib/sound'
import AchievementToast from './AchievementToast'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function checkFirstVisitToday(): boolean {
  const key = 'roost.lastVisit'
  const last = localStorage.getItem(key) ?? ''
  const today = todayKey()
  if (last !== today) {
    localStorage.setItem(key, today)
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Daily bonus modal
// ---------------------------------------------------------------------------

interface DailyBonusModalProps {
  onClaim: () => void
}

function DailyBonusModal({ onClaim }: DailyBonusModalProps) {
  const [claimed, setClaimed] = useState(false)

  function handleClaim() {
    const result = claimDailyBonus()
    if (result) {
      try { playSound('dailyBonus') } catch { /* guard */ }
    }
    setClaimed(true)
    setTimeout(onClaim, 900)
  }

  return (
    <>
      <style>{`
        @keyframes hudBonusIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1);   }
        }
        @keyframes hudBonusFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      {/* Backdrop — blocks interaction with the rest of the app while visible */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,.62)',
          backdropFilter: 'blur(4px)',
          animation: claimed ? 'hudBonusFadeOut .4s ease forwards' : 'none',
        }}
        onClick={() => { /* intentionally swallow clicks */ }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bonus quotidien"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 201,
          transform: 'translate(-50%, -50%)',
          width: 320,
          borderRadius: 20,
          background: 'rgba(20, 16, 10, 0.97)',
          border: '1.5px solid rgba(201,169,75,.45)',
          boxShadow: '0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(201,169,75,.1)',
          padding: '28px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
          animation: claimed
            ? 'hudBonusFadeOut .4s ease forwards'
            : 'hudBonusIn .4s cubic-bezier(.2,.8,.2,1) forwards',
        }}
      >
        {/* Star burst */}
        <div style={{ fontSize: 52, lineHeight: 1 }}>🌟</div>

        {/* Title */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#E8C96A',
              letterSpacing: '-0.01em',
              marginBottom: 4,
            }}
          >
            Bonus quotidien!
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
            Revenez chaque jour pour gagner plus
          </div>
        </div>

        {/* Reward pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Pill icon="🪙" value="+50" label="coins" />
          <Pill icon="⚡" value="+100" label="XP" />
        </div>

        {/* CTA */}
        <button
          onClick={handleClaim}
          disabled={claimed}
          style={{
            marginTop: 4,
            padding: '12px 32px',
            border: 'none',
            borderRadius: 12,
            background: claimed
              ? 'rgba(255,255,255,.1)'
              : 'linear-gradient(135deg, #C9A94B, #E8C96A)',
            color: claimed ? 'rgba(255,255,255,.4)' : '#1a1200',
            fontWeight: 800,
            fontSize: 15,
            cursor: claimed ? 'default' : 'pointer',
            transition: 'all .2s',
            letterSpacing: '-0.01em',
          }}
        >
          {claimed ? '✓ Réclamé!' : 'Réclamer!'}
        </button>
      </div>
    </>
  )
}

function Pill({
  icon,
  value,
  label,
}: {
  icon: string
  value: string
  label: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 18px',
        borderRadius: 12,
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.1)',
        minWidth: 80,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 800, color: '#E8C96A' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HUD bar
// ---------------------------------------------------------------------------

export default function HUD() {
  const gs = useGamification()
  const [visible, setVisible] = useState(true)
  const [showBonus, setShowBonus] = useState(false)
  const mountedRef = useRef(false)

  // On first mount, check if it's a new day → show daily bonus
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    // Only show if daily bonus has not already been claimed today
    const isFirstVisit = checkFirstVisitToday()
    const alreadyClaimed = gs.dailyBonusClaimed === todayKey()
    if (isFirstVisit && !alreadyClaimed) {
      // Slight delay so the app renders first
      const t = setTimeout(() => setShowBonus(true), 600)
      return () => clearTimeout(t)
    }
  }, [gs.dailyBonusClaimed])

  // Most-leveled agent
  const agents = Object.values(gs.agents)
  const topAgent = agents.length > 0
    ? agents.reduce((a, b) => (a.level >= b.level ? a : b))
    : null

  return (
    <>
      <style>{`
        @keyframes hudSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hudSlideUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-100%); }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* HUD bar — pointer-events: none on container so it passes through    */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-label="Game HUD"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(12, 10, 6, 0.78)',
          backdropFilter: 'blur(8px)',
          animation: visible
            ? 'hudSlideDown .35s cubic-bezier(.2,.8,.2,1) both'
            : 'hudSlideUp .25s cubic-bezier(.4,0,1,1) both',
        }}
      >
        {/* LEFT — coins + XP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <StatChip icon="🪙" value={gs.globalCoins} color="#E8C96A" />
          <Divider />
          <StatChip icon="⚡" value={gs.globalXp} label="XP" color="#2FB3A3" />
        </div>

        {/* CENTER — transparent */}
        <div style={{ flex: 1 }} />

        {/* RIGHT — toggle + top agent level */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'auto',
          }}
        >
          {topAgent && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,.55)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,.3)' }}>top agent</span>
              <span style={{ color: '#fff', fontWeight: 800 }}>{topAgent.agentKey}</span>
              <span
                style={{
                  padding: '1px 7px',
                  borderRadius: 8,
                  background: 'rgba(47,179,163,.25)',
                  color: '#2FB3A3',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                Lv.{topAgent.level}
              </span>
            </div>
          )}

          <button
            onClick={() => setVisible((v) => !v)}
            title={visible ? 'Masquer le HUD' : 'Afficher le HUD'}
            aria-pressed={!visible}
            style={{
              width: 28,
              height: 28,
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 8,
              background: 'rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.7)',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Daily bonus modal */}
      {showBonus && (
        <DailyBonusModal onClaim={() => setShowBonus(false)} />
      )}

      {/* Achievement toasts */}
      <AchievementToast />
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: string
  value: number
  label?: string
  color: string
}) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        color: 'rgba(255,255,255,.85)',
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString()}
      </span>
      {label && (
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>{label}</span>
      )}
    </span>
  )
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 1,
        height: 14,
        background: 'rgba(255,255,255,.15)',
        borderRadius: 1,
      }}
    />
  )
}
