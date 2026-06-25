import { useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import NeedsAttention from './components/NeedsAttention'
import Scene from './components/Scene'
import FicheAgent from './components/FicheAgent'
import { AGENTS } from './data/agents'

export type Mode = 'Vie' | 'Construction'

export default function WorldView() {
  const [mode, setMode] = useState<Mode>('Vie')
  const [openAgent, setOpenAgent] = useState<string | null>(null)

  useEffect(() => {
    if (!openAgent) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenAgent(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openAgent])

  return (
    <>
      <AppShell
        active="/"
        title="Le Monde"
        subtitle={`Studio · ${Object.keys(AGENTS).length} agents · ${Object.values(AGENTS).filter(a => a.state === 'working').length} actifs`}
        mode={mode}
        onMode={setMode}
        contentStyle={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <NeedsAttention />
        <Scene showGrid={mode === 'Construction'} onOpenAgent={setOpenAgent} />
      </AppShell>

      {openAgent && <FicheAgent agentKey={openAgent} onClose={() => setOpenAgent(null)} />}
    </>
  )
}
