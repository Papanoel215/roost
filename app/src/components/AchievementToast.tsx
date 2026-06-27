import { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Global event emitter for achievement toasts
// ---------------------------------------------------------------------------

export interface AchievementPayload {
  title: string
  description: string
  icon: string
}

type Listener = (a: AchievementPayload) => void
const listeners = new Set<Listener>()

export function fireAchievement(achievement: AchievementPayload): void {
  listeners.forEach((fn) => fn(achievement))
}

// ---------------------------------------------------------------------------
// Internal toast state
// ---------------------------------------------------------------------------

interface ToastItem extends AchievementPayload {
  id: number
  exiting: boolean
}

let nextId = 1

// ---------------------------------------------------------------------------
// Single toast card
// ---------------------------------------------------------------------------

function Toast({
  item,
  onDone,
}: {
  item: ToastItem
  onDone: (id: number) => void
}) {
  const [progress, setProgress] = useState(100)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const DURATION = 4000

  useEffect(() => {
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(pct)
      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onDone(item.id)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [item.id, onDone])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: 300,
        padding: '12px 14px 10px',
        borderRadius: 14,
        background: 'rgba(18, 14, 8, 0.95)',
        border: '1.5px solid #C9A94B',
        boxShadow: '0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(201,169,75,.15)',
        backdropFilter: 'blur(12px)',
        animation: item.exiting
          ? 'achievementSlideOut .35s cubic-bezier(.4,0,1,1) forwards'
          : 'achievementSlideIn .35s cubic-bezier(.2,.8,.2,1) forwards',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Icon */}
        <span
          style={{
            fontSize: 36,
            lineHeight: 1,
            flexShrink: 0,
            filter: 'drop-shadow(0 2px 4px rgba(201,169,75,.4))',
          }}
          aria-hidden="true"
        >
          {item.icon}
        </span>

        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#C9A94B',
              marginBottom: 2,
            }}
          >
            Succès débloqué!
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,.55)',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.description}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: 'rgba(255,255,255,.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #C9A94B, #E8C96A)',
            transition: 'none',
          }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Container component — renders up to 3 toasts stacked
// ---------------------------------------------------------------------------

export default function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (a: AchievementPayload) => {
      setToasts((prev) => {
        // Cap at 3; oldest drops off if needed
        const capped = prev.length >= 3 ? prev.slice(1) : prev
        return [...capped, { ...a, id: nextId++, exiting: false }]
      })
    }
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }, [])

  const handleDone = (id: number) => {
    // Trigger exit animation, then remove
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 380)
  }

  if (toasts.length === 0) return null

  return (
    <>
      {/* Keyframe definitions */}
      <style>{`
        @keyframes achievementSlideIn {
          from { opacity: 0; transform: translateX(120px) scale(.92); }
          to   { opacity: 1; transform: translateX(0)    scale(1);   }
        }
        @keyframes achievementSlideOut {
          from { opacity: 1; transform: translateX(0)    scale(1);   }
          to   { opacity: 0; transform: translateX(120px) scale(.92); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          alignItems: 'flex-end',
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDone={handleDone} />
        ))}
      </div>
    </>
  )
}
