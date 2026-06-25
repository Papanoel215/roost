import type { Mode } from '../WorldView'
import { useUi } from '../ui/UiContext'
import { IconRings, IconBell, IconHeart, IconConstruction, IconSearch, IconPlus } from './icons'

interface TopBarProps {
  title: string
  subtitle: string
  /** si fourni, affiche la bascule Vie / Construction (écran studio) */
  mode?: Mode
  onMode?: (m: Mode) => void
}

export default function TopBar({ title, subtitle, mode, onMode }: TopBarProps) {
  const { openPalette, openNewMission } = useUi()
  const cons = mode === 'Construction'

  return (
    <header
      style={{
        height: 64,
        flex: 'none',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span className="display" style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{subtitle}</span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="topbar-pill">
          <IconRings size={15} color="var(--vital-energy)" />
          <span style={{ fontWeight: 700, fontSize: 13 }}>3,42&nbsp;$</span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>aujourd'hui</span>
        </div>

        <div className="topbar-pill">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--teal)',
              boxShadow: '0 0 0 3px rgba(47,179,163,.18)',
              animation: 'spark 1.8s ease-in-out infinite',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 13 }}>2 runs actifs</span>
        </div>

        <button
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--rest)',
          }}
        >
          <IconBell size={18} color="var(--text2)" />
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--blocked)',
              border: '2px solid var(--surface)',
            }}
          />
        </button>

        {mode && onMode && (
          <div
            role="tablist"
            aria-label="Mode du studio"
            style={{ display: 'flex', background: '#F1EBE2', border: '1px solid var(--border)', borderRadius: 12, padding: 3, gap: 3 }}
          >
            <button
              role="tab"
              aria-selected={!cons}
              onClick={() => onMode('Vie')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: cons ? 'transparent' : '#FFFFFF', color: cons ? 'var(--text2)' : 'var(--text)', boxShadow: cons ? 'none' : 'var(--rest)',
              }}
            >
              <IconHeart size={15} stroke={2} />
              Vie
            </button>
            <button
              role="tab"
              aria-selected={cons}
              onClick={() => onMode('Construction')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: cons ? '#FFFFFF' : 'transparent', color: cons ? 'var(--text)' : 'var(--text2)', boxShadow: cons ? 'var(--rest)' : 'none',
              }}
            >
              <IconConstruction size={15} stroke={2} />
              Construction
            </button>
          </div>
        )}

        <button className="btn btn-ghost" style={{ color: 'var(--text3)', fontWeight: 400 }} onClick={openPalette}>
          <IconSearch size={15} />
          Rechercher
          <kbd>⌘K</kbd>
        </button>

        <button className="btn btn-primary" onClick={openNewMission}>
          <IconPlus size={16} />
          Nouvelle mission
        </button>
      </div>
    </header>
  )
}
