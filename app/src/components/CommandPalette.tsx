import { useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from 'react'
import { useUi, go } from '../ui/UiContext'

interface Cmd {
  id: string
  label: string
  hint: string
  icon: ReactNode
  danger?: boolean
  run: () => void
}

function I({ children }: { children: ReactNode }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const ui = useUi()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Cmd[] = useMemo(
    () => [
      { id: 'new', label: 'Nouvelle mission', hint: 'Créer et estimer une mission', icon: <I><path d="M12 5v14M5 12h14" /></I>, run: () => { onClose(); ui.openNewMission() } },
      { id: 'world', label: 'Aller au Monde', hint: 'Le studio des agents', icon: <I><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></I>, run: () => { onClose(); go('/') } },
      { id: 'missions', label: 'Voir les missions', hint: 'Tableau Kanban', icon: <I><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 1.6-1.6M4 12l1 1 1.6-1.6M4 18l1 1 1.6-1.6" /></I>, run: () => { onClose(); go('/missions') } },
      { id: 'revue', label: 'Ouvrir la revue', hint: '3 artefacts en attente', icon: <I><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 12l2.5 2.5L16 9" /></I>, run: () => { onClose(); go('/revue') } },
      { id: 'analytics', label: 'Ouvrir l’analytics', hint: 'Productivité & coûts', icon: <I><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></I>, run: () => { onClose(); go('/analytics') } },
      { id: 'ds', label: 'Planche design system', hint: 'Tokens & composants', icon: <I><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="10.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="12.5" r="2.5" /><path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-3.5 3H16a2 2 0 0 0-1 3.7A2 2 0 0 1 12 22Z" /></I>, run: () => { onClose(); go('/design-system') } },
      { id: 'create', label: 'Créer un agent', hint: 'Recruter un nouvel agent', icon: <I><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M18 8v6M21 11h-6" /></I>, run: () => { onClose(); go('/creer-agent') } },
      { id: 'byok', label: 'Configurer mes clés (BYOK)', hint: 'Anthropic · Gemini · workspace', icon: <I><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 19 4M16 7l3 3M14 9l2 2" /></I>, run: () => { onClose(); go('/onboarding') } },
      { id: 'mobile', label: 'Vue mobile (PWA)', hint: 'Approbations depuis le téléphone', icon: <I><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></I>, run: () => { onClose(); go('/mobile') } },
      { id: 'store', label: 'Magasin de compétences (MCP)', hint: 'Connecteurs à attacher aux agents', icon: <I><path d="M3 9h18l-1.5 11H4.5L3 9ZM8 9V6a4 4 0 0 1 8 0v3" /></I>, run: () => { onClose(); go('/magasin') } },
      { id: 'runs', label: 'Historique des runs', hint: 'Statut, coût, durée, replay', icon: <I><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></I>, run: () => { onClose(); go('/runs') } },
      { id: 'settings', label: 'Paramètres', hint: 'Profil, clés, facturation', icon: <I><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.3-1.3L13.8 2h-3.6l-.4 2.5a7 7 0 0 0-2.3 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.3 1.3l.4 2.5h3.6l.4-2.5a7 7 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z" /></I>, run: () => { onClose(); go('/parametres') } },
      { id: 'team', label: 'Équipe & collaboration', hint: 'Membres, rôles, commentaires', icon: <I><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 5.2a3.2 3.2 0 0 1 0 5.6M21 20a6 6 0 0 0-5-5.9" /></I>, run: () => { onClose(); go('/equipe') } },
      { id: 'audit', label: 'Journal d’audit', hint: 'Actions, approbations, dépenses', icon: <I><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></I>, run: () => { onClose(); go('/audit') } },
      { id: 'import', label: 'Importer un projet', hint: 'Détecter règles, MCP & agents', icon: <I><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></I>, run: () => { onClose(); go('/import') } },
      { id: 'convos', label: 'Historique des conversations', hint: 'Reprends un échange avec un agent', icon: <I><path d="M21 12a8 8 0 0 1-11.3 7.3L3 21l1.7-6.7A8 8 0 1 1 21 12Z" /></I>, run: () => { onClose(); go('/conversations') } },
      { id: 'apercu', label: 'Aperçu live (vue scindée)', hint: 'Diff + rendu en direct', icon: <I><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></I>, run: () => { onClose(); go('/apercu') } },
      { id: 'search', label: 'Recherche globale', hint: 'Agents · missions · runs · artefacts', icon: <I><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></I>, run: () => { onClose(); go('/recherche') } },
      { id: 'pause', label: 'Mettre tous les agents en pause', hint: 'Suspend les runs en cours', icon: <I><path d="M7 5v14M17 5v14" /></I>, run: () => { onClose(); ui.pauseAll() } },
      { id: 'stop', label: 'Arrêt d’urgence', hint: 'Stoppe tout immédiatement', danger: true, icon: <I><circle cx="12" cy="12" r="9" /><path d="M9 9h6v6H9z" /></I>, run: () => { onClose(); ui.emergencyStop() } },
    ],
    [ui, onClose],
  )

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()) || c.hint.toLowerCase().includes(q.toLowerCase()))

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[sel]?.run() }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(35,25,18,.34)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh', animation: 'fadein .15s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 560, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 16, boxShadow: '0 20px 60px rgba(40,25,12,.30)', border: '1px solid var(--border)', overflow: 'hidden', animation: 'slidein .2s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0) }}
            onKeyDown={onKey}
            placeholder="Rechercher une action, un écran…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-body)' }}
          />
          <kbd>Échap</kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Aucune action</div>}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              onMouseEnter={() => setSel(i)}
              onClick={c.run}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: i === sel ? (c.danger ? 'rgba(229,86,75,.10)' : 'rgba(224,120,86,.10)') : 'transparent',
                color: c.danger ? 'var(--blocked)' : 'var(--text)',
              }}
            >
              <span style={{ flex: 'none', display: 'flex', color: c.danger ? 'var(--blocked)' : 'var(--text2)' }}>{c.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{c.label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text3)' }}>{c.hint}</span>
              </span>
              {i === sel && <kbd>↵</kbd>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
