import type { ReactNode } from 'react'
import { BrandMark } from './Plumbob'
import { useSettings } from '../lib/store'
import { signOut } from '../lib/auth'
import {
  IconCompass,
  IconMissions,
  IconReview,
  IconClock,
  IconBars,
  IconGear,
  IconRings,
} from './icons'

interface NavItemProps {
  icon: ReactNode
  label: string
  href: string
  active?: boolean
  badge?: number
}

function NavItem({ icon, label, href, active, badge }: NavItemProps) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 12px',
        borderRadius: 12,
        textDecoration: 'none',
        background: active ? 'rgba(224,120,86,.12)' : 'transparent',
        color: active ? 'var(--ter)' : 'var(--text2)',
        fontWeight: active ? 600 : 500,
      }}
    >
      {icon}
      {label}
      {badge != null && (
        <span
          style={{
            marginLeft: 'auto',
            background: 'var(--ter)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '1px 7px',
            borderRadius: 999,
          }}
        >
          {badge}
        </span>
      )}
    </a>
  )
}

const NAV = [
  { label: 'Le Monde', href: '#/', icon: <IconCompass /> },
  { label: 'Missions', href: '#/missions', icon: <IconMissions /> },
  { label: 'Revue', href: '#/revue', icon: <IconReview />, badge: 3 },
  { label: 'Timeline', href: '#/timeline', icon: <IconClock /> },
  { label: 'Analytics', href: '#/analytics', icon: <IconBars /> },
  { label: 'Paramètres', href: '#/parametres', icon: <IconGear /> },
]

export default function Sidebar({ active = '/' }: { active?: string }) {
  const s = useSettings()
  return (
    <aside
      style={{
        width: 240,
        flex: 'none',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        gap: 6,
      }}
    >
      <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 18px', textDecoration: 'none' }}>
        <BrandMark size={30} />
        <span
          className="display"
          style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.5px', color: 'var(--text)' }}
        >
          Roost
        </span>
      </a>

      {NAV.map((n) => (
        <NavItem key={n.href} {...n} active={active === n.href.replace('#', '')} />
      ))}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href="#/design-system"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 12px',
            borderRadius: 12,
            color: active === '/design-system' ? 'var(--ter)' : 'var(--text3)',
            fontWeight: 600,
            fontSize: 12,
            textDecoration: 'none',
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" />
            <circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-3.5 3H16a2 2 0 0 0-1 3.7A2 2 0 0 1 12 22Z" />
          </svg>
          Design system
        </a>

        {/* budget du jour */}
        <div
          style={{
            background: 'linear-gradient(135deg,#FFF3EC,#FDEBE2)',
            border: '1px solid #F3DDD0',
            borderRadius: 14,
            padding: '12px 13px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              color: 'var(--text2)',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            <IconRings size={14} color="var(--ter)" />
            Budget du jour
          </div>
          <div style={{ height: 7, borderRadius: 999, background: '#F1DDCF', overflow: 'hidden' }}>
            <div
              style={{
                width: '17%',
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg,#F2A93C,#E07856)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>3,42&nbsp;$</span>
            <span style={{ color: 'var(--text3)' }}>/ 20&nbsp;$</span>
          </div>
        </div>

        {/* utilisateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              flex: 'none',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 28%,#8FD9CC,#2FB3A3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: 'var(--rest)',
            }}
          >
            {(s.profile.name[0] || 'M').toUpperCase()}
          </div>
          <div style={{ minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{s.profile.name || 'Maxime'}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Plan Pro</div>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              background: 'rgba(47,179,163,.14)',
              color: 'var(--tealdeep)',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 999,
            }}
          >
            PRO
          </span>
          <button
            onClick={signOut}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            style={{ width: 28, height: 28, flex: 'none', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
