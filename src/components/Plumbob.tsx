import type { CSSProperties } from 'react'

export type PlumbobVariant = 'healthy' | 'attention' | 'blocked' | 'sleeping'

const VARIANTS: Record<PlumbobVariant, { tl: string; tr: string; bl: string; br: string; glow: string }> = {
  healthy: { tl: '#6FD79B', tr: '#3DBE7A', bl: '#3DBE7A', br: '#2E9E63', glow: 'rgba(61,190,122,.4)' },
  attention: { tl: '#F8CF6E', tr: '#F2B23C', bl: '#F2B23C', br: '#D89318', glow: 'rgba(242,178,60,.45)' },
  blocked: { tl: '#F08A82', tr: '#E5564B', bl: '#E5564B', br: '#C23E34', glow: 'rgba(229,86,75,.4)' },
  sleeping: { tl: '#B9B0A4', tr: '#A89F92', bl: '#A89F92', br: '#8A8174', glow: 'transparent' },
}

interface PlumbobProps {
  variant: PlumbobVariant
  width?: number
  height?: number
  floatDur?: number
  floatDelay?: number
  sparkDur?: number
  style?: CSSProperties
}

/** Le plumbob signature : diamant facetté qui flotte au-dessus de l'agent. */
export default function Plumbob({
  variant,
  width = 36,
  height = 50,
  floatDur = 3.8,
  floatDelay = 0,
  sparkDur = 1.7,
  style,
}: PlumbobProps) {
  const c = VARIANTS[variant]
  const sleeping = variant === 'sleeping'

  const svgStyle: CSSProperties = sleeping
    ? { marginBottom: -4, opacity: 0.4, filter: 'grayscale(.6)', ...style }
    : {
        marginBottom: -4,
        animation: `pb-float ${floatDur}s ease-in-out infinite ${floatDelay}s`,
        filter: `drop-shadow(0 5px 7px ${c.glow})`,
        ...style,
      }

  return (
    <svg width={width} height={height} viewBox="0 0 40 56" style={svgStyle} aria-hidden="true">
      <path d="M20,2 L4,21 L20,21 Z" fill={c.tl} />
      <path d="M20,2 L36,21 L20,21 Z" fill={c.tr} />
      <path d="M4,21 L20,52 L20,21 Z" fill={c.bl} />
      <path d="M36,21 L20,52 L20,21 Z" fill={c.br} />
      {!sleeping && (
        <path
          d="M30,6 c.4,3 .6,3.3 3.5,4.3 c-2.9,1 -3.1,1.3 -3.5,4.3 c-.4,-3 -.6,-3.3 -3.5,-4.3 c2.9,-1 3.1,-1.3 3.5,-4.3Z"
          fill="#fff"
          fillOpacity={0.9}
          style={{ animation: `spark ${sparkDur}s ease-in-out infinite` }}
        />
      )}
    </svg>
  )
}

/** Marque Roost : plumbob bicolore terracotta/teal + étincelle. */
export function BrandMark({ size = 30, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={(size * 56) / 40}
      viewBox="0 0 40 56"
      style={{ filter: 'drop-shadow(0 3px 4px rgba(122,74,46,.22))' }}
      aria-hidden="true"
    >
      <path d="M20,2 L4,21 L20,21 Z" fill="#F2A98C" />
      <path d="M20,2 L36,21 L20,21 Z" fill="#E07856" />
      <path d="M4,21 L20,52 L20,21 Z" fill="#2FB3A3" />
      <path d="M36,21 L20,52 L20,21 Z" fill="#1E8C7F" />
      <path
        d="M30,6 c.4,3.4 .7,3.7 4,4.8 c-3.3,1.1 -3.6,1.4 -4,4.8 c-.4,-3.4 -.7,-3.7 -4,-4.8 c3.3,-1.1 3.6,-1.4 4,-4.8 Z"
        fill="#fff"
        fillOpacity={0.95}
        style={animated ? { animation: 'spark 1.8s ease-in-out infinite' } : undefined}
      />
    </svg>
  )
}
