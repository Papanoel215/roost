import type { CSSProperties, ReactNode } from 'react'

export type Face = 'happy' | 'worried' | 'sleepy'

interface AgentBodyProps {
  /** unique suffix for gradient ids */
  id: string
  width: number
  height: number
  from: string
  to: string
  face?: Face
  highlight?: boolean
  /** blush dot colour; omit for none */
  blush?: string
  /** arm fill colour; omit for no arms */
  arms?: string
  /** override mouth path */
  mouth?: string
  grayscale?: number
  opacity?: number
  breatheAnim?: 'breathe' | 'breathe-slow'
  breatheDur?: number
  breatheDelay?: number
  shadowRx?: number
  shadowRy?: number
  shadowOpacity?: number
  /** belly accessory <g>… (positioned in the 140×175 viewBox) */
  children?: ReactNode
}

const MOUTHS: Record<Face, string> = {
  happy: 'M62 67 q8 6 16 0',
  worried: 'M62 70 q8 -5 16 0',
  sleepy: 'M64 68 q6 3 12 0',
}

/** Personnage stylisé « pâte à modeler » — rond, doux, soft-3D. */
export default function AgentBody({
  id,
  width,
  height,
  from,
  to,
  face = 'happy',
  highlight = true,
  blush,
  arms,
  mouth,
  grayscale,
  opacity,
  breatheAnim = 'breathe',
  breatheDur = 3,
  breatheDelay = 0,
  shadowRx = 41,
  shadowRy = 9,
  shadowOpacity = 0.17,
  children,
}: AgentBodyProps) {
  const outer: CSSProperties = {}
  if (grayscale != null) outer.filter = `grayscale(${grayscale})`
  if (opacity != null) outer.opacity = opacity

  const breathe: CSSProperties = {
    transformOrigin: '70px 160px',
    animation: `${breatheAnim} ${breatheDur}s ease-in-out infinite ${breatheDelay}s`,
  }

  const armStyle = (origin: string, delay: string): CSSProperties => ({
    transformOrigin: origin,
    animation: `bob 1s ease-in-out infinite ${delay}`,
  })

  return (
    <svg width={width} height={height} viewBox="0 0 140 175" style={outer} aria-hidden="true">
      <ellipse cx="70" cy="168" rx={shadowRx} ry={shadowRy} fill={`rgba(60,40,20,${shadowOpacity})`} />
      <g style={breathe}>
        <defs>
          <radialGradient id={`b${id}`} cx="35%" cy="26%" r="80%">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </radialGradient>
          <radialGradient id={`h${id}`} cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#EFE7DC" />
          </radialGradient>
        </defs>

        <rect x="40" y="80" width="60" height="78" rx="30" fill={`url(#b${id})`} />

        {arms && (
          <>
            <ellipse cx="44" cy="117" rx="9" ry="14" fill={arms} style={armStyle('46px 107px', '0s')} />
            <ellipse cx="96" cy="117" rx="9" ry="14" fill={arms} style={armStyle('94px 107px', '.5s')} />
          </>
        )}

        <circle cx="70" cy="54" r="31" fill={`url(#h${id})`} />
        {highlight && <ellipse cx="59" cy="44" rx="10" ry="7" fill="rgba(255,255,255,.5)" />}

        {face === 'happy' && (
          <>
            <circle cx="59" cy="56" r="3.4" fill="#2A251F" />
            <circle cx="81" cy="56" r="3.4" fill="#2A251F" />
            {blush && (
              <>
                <circle cx="52" cy="62" r="3" fill={blush} />
                <circle cx="88" cy="62" r="3" fill={blush} />
              </>
            )}
          </>
        )}
        {face === 'worried' && (
          <path d="M58 56 l8 6 M82 56 l-8 6" stroke="#2A251F" strokeWidth="3" strokeLinecap="round" />
        )}
        {face === 'sleepy' && (
          <path
            d="M56 54 q3 -3 7 0 M77 54 q3 -3 7 0"
            stroke="#2A251F"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        )}

        <path
          d={mouth ?? MOUTHS[face]}
          fill="none"
          stroke="#2A251F"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        <circle cx="70" cy="118" r="15" fill="rgba(255,255,255,.92)" />
        {children}
      </g>
    </svg>
  )
}
