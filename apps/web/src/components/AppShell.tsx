import type { CSSProperties, ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { Mode } from '../WorldView'

interface AppShellProps {
  active: string
  title: string
  subtitle: string
  mode?: Mode
  onMode?: (m: Mode) => void
  contentStyle?: CSSProperties
  children: ReactNode
}

/** Gabarit commun : barre latérale + barre supérieure + zone de contenu. */
export default function AppShell({ active, title, subtitle, mode, onMode, contentStyle, children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar active={active} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title={title} subtitle={subtitle} mode={mode} onMode={onMode} />
        <div style={{ flex: 1, minHeight: 0, ...contentStyle }}>{children}</div>
      </div>
    </div>
  )
}
