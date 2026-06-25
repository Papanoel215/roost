import { useEffect, useState } from 'react'
import { useHashRoute } from './useHashRoute'
import { useSession } from './lib/auth'
import { useSettings } from './lib/store'
import Auth from './components/Auth'
import KeyOnboarding from './components/KeyOnboarding'
import { UiContext, type UiActions } from './ui/UiContext'
import WorldView from './WorldView'
import Missions from './components/Missions'
import Revue from './components/Revue'
import Analytics from './components/Analytics'
import DesignSystem from './components/DesignSystem'
import CreateAgent from './components/CreateAgent'
import Onboarding from './components/Onboarding'
import MobileView from './components/MobileView'
import Settings from './components/Settings'
import SkillsStore from './components/SkillsStore'
import RunHistory from './components/RunHistory'
import Team from './components/Team'
import Audit from './components/Audit'
import ProjectImport from './components/ProjectImport'
import Conversations from './components/Conversations'
import LivePreview from './components/LivePreview'
import GlobalSearch from './components/GlobalSearch'
import ComingSoon from './components/ComingSoon'
import CommandPalette from './components/CommandPalette'
import NewMissionModal from './components/NewMissionModal'
import UpdateBanner from './components/UpdateBanner'

export type { Mode } from './WorldView'

export default function App() {
  const route = useHashRoute()
  const session = useSession()
  const settings = useSettings()
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    const email = session?.email || 'default'
    setOnboarded(localStorage.getItem(`roost.onboarded.${email}`) === '1')
  }, [session])
  const [motion, setMotion] = useState(true)
  const [palette, setPalette] = useState(false)
  const [newMission, setNewMission] = useState(false)
  const [toast, setToast] = useState<{ text: string; danger?: boolean } | null>(null)

  const showToast = (text: string, danger?: boolean) => {
    setToast({ text, danger })
    window.setTimeout(() => setToast(null), 2800)
  }

  // ⌘K / Ctrl+K → palette de commandes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ui: UiActions = {
    openPalette: () => setPalette(true),
    openNewMission: () => setNewMission(true),
    pauseAll: () => { setMotion(false); showToast('Tous les agents sont en pause.') },
    emergencyStop: () => { setMotion(false); showToast("Arrêt d'urgence — tous les runs stoppés.", true) },
  }

  const screen = () => {
    switch (route) {
      case '/missions': return <Missions />
      case '/revue': return <Revue />
      case '/analytics': return <Analytics />
      case '/design-system': return <DesignSystem />
      case '/creer-agent': return <CreateAgent />
      case '/onboarding': return <Onboarding />
      case '/mobile': return <MobileView />
      case '/parametres': return <Settings />
      case '/magasin': return <SkillsStore />
      case '/runs': return <RunHistory />
      case '/equipe': return <Team />
      case '/audit': return <Audit />
      case '/import': return <ProjectImport />
      case '/conversations': return <Conversations />
      case '/apercu': return <LivePreview />
      case '/recherche': return <GlobalSearch />
      case '/timeline': return <ComingSoon route="/timeline" title="Timeline" />
      default: return <WorldView />
    }
  }

  // porte d'entrée : pas de session → auth
  if (!session) return <Auth />

  // première connexion sans clé API → onboarding
  if (!onboarded && !settings.keys.anthropic) {
    return (
      <KeyOnboarding
        onDone={() => {
          const email = session?.email || 'default'
          localStorage.setItem(`roost.onboarded.${email}`, '1')
          setOnboarded(true)
        }}
      />
    )
  }

  return (
    <UiContext.Provider value={ui}>
      <div data-motion={motion ? 'on' : 'off'}>
        <UpdateBanner />
        {screen()}

        {palette && <CommandPalette onClose={() => setPalette(false)} />}
        {newMission && <NewMissionModal onClose={() => setNewMission(false)} />}

        {toast && (
          <div
            role="status"
            style={{
              position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 70,
              display: 'flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 12,
              background: toast.danger ? 'var(--blocked)' : 'var(--text)', color: '#fff', fontSize: 13, fontWeight: 600,
              boxShadow: '0 10px 30px rgba(40,25,12,.25)', animation: 'slidein .2s ease',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.85 }} />
            {toast.text}
          </div>
        )}

        {/* bascule des animations ambiantes (respecte aussi prefers-reduced-motion) */}
        <button
          onClick={() => setMotion((m) => !m)}
          title={motion ? 'Couper les animations' : 'Activer les animations'}
          aria-pressed={!motion}
          style={{
            position: 'fixed', right: 16, bottom: 16, zIndex: 50, width: 40, height: 40, borderRadius: 12,
            border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--rest)', cursor: 'pointer', fontSize: 16, lineHeight: 1,
          }}
        >
          {motion ? '❙❙' : '►'}
        </button>
      </div>
    </UiContext.Provider>
  )
}
