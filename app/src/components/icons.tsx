import type { CSSProperties, ReactNode } from 'react'

interface IconProps {
  size?: number
  stroke?: number
  color?: string
  style?: CSSProperties
  className?: string
}

/** Base line-icon wrapper — rounded Lucide-style stroke on currentColor. */
function Line({
  size = 19,
  stroke = 1.9,
  color = 'currentColor',
  style,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconCompass = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </Line>
)

export const IconMissions = (p: IconProps) => (
  <Line {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6l1 1 1.6-1.6M4 12l1 1 1.6-1.6M4 18l1 1 1.6-1.6" />
  </Line>
)

export const IconReview = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M8 12l2.5 2.5L16 9" />
  </Line>
)

export const IconClock = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Line>
)

export const IconBars = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Line>
)

export const IconGear = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-1.2 2.9Z" />
  </Line>
)

/** Deux anneaux entrelacés — utilisé pour le budget/coût. */
export const IconRings = ({ color = 'var(--vital-energy)', stroke = 2, ...p }: IconProps) => (
  <Line color={color} stroke={stroke} {...p}>
    <circle cx="9" cy="9" r="6" />
    <circle cx="15" cy="15" r="6" />
  </Line>
)

export const IconBell = (p: IconProps) => (
  <Line {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Line>
)

export const IconHeart = (p: IconProps) => (
  <Line {...p}>
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
  </Line>
)

export const IconHeartSearch = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" />
  </Line>
)

export const IconConstruction = (p: IconProps) => (
  <Line {...p}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-7 7 2.6 2.6 7-7a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-2.6 2.4-2.4Z" />
  </Line>
)

export const IconSearch = (p: IconProps) => (
  <Line {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </Line>
)

export const IconSearchAlert = (p: IconProps) => (
  <Line {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
    <path d="M11 8v3M11 14h.01" />
  </Line>
)

export const IconPlus = ({ stroke = 2.2, ...p }: IconProps) => (
  <Line stroke={stroke} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Line>
)

export const IconPaintbrush = ({ stroke = 2, ...p }: IconProps) => (
  <Line stroke={stroke} {...p}>
    <path d="M3 21s4-1 6-3l8-8-3-3-8 8c-2 2-3 6-3 6Z" />
    <path d="M14 7l3 3" />
  </Line>
)

export const IconActivity = ({ stroke = 2, ...p }: IconProps) => (
  <Line stroke={stroke} {...p}>
    <path d="M5 12h4l2-7 4 14 2-7h2" />
  </Line>
)

export const IconHelpCircle = ({ stroke = 2, ...p }: IconProps) => (
  <Line stroke={stroke} {...p}>
    <path d="M12 17v.01M12 13a2 2 0 1 0-2-2" />
    <circle cx="12" cy="12" r="9" />
  </Line>
)

export const IconAlert = ({ stroke = 2.4, ...p }: IconProps) => (
  <Line stroke={stroke} {...p}>
    <path d="M12 8v5M12 17h.01" />
    <circle cx="12" cy="12" r="9" />
  </Line>
)
