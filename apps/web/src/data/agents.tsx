import type { ReactNode } from 'react'
import type { Face } from '../components/AgentBody'
import type { PlumbobVariant } from '../components/Plumbob'

export type AgentState = 'working' | 'permission' | 'blocked' | 'sleeping'

interface Engine {
  label: string
  kind: 'anthropic' | 'gemini'
  model: string
  bg: string
  border: string
  color: string
}

const SONNET: Engine = { label: 'Claude Sonnet 4.6', kind: 'anthropic', model: 'claude-sonnet-4-6', bg: '#F4EEFB', border: '#E4D8F5', color: '#6A4FB0' }
const OPUS: Engine = { label: 'Claude Opus 4.8', kind: 'anthropic', model: 'claude-opus-4-8', bg: '#F4EEFB', border: '#E4D8F5', color: '#6A4FB0' }
const FLASH: Engine = { label: 'Gemini 2.5 Flash', kind: 'gemini', model: 'gemini-2.5-flash', bg: '#EAF3FB', border: '#D5E6F5', color: '#2C74A6' }

const accessories: Record<string, ReactNode> = {
  paintbrush: (
    <g stroke="#C23E55" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M63 122l9-9 3 3-9 9z" />
      <path d="M72 113l2-2 3 3-2 2" />
    </g>
  ),
  gear: (
    <g stroke="#1A7468" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="70" cy="118" r="4.5" />
      <path d="M70 109v-3M70 130v-3M79 118h3M58 118h3M76.5 111.5l2 2M61.5 124.5l2 2M76.5 124.5l2-2M61.5 111.5l2-2" />
    </g>
  ),
  magnifier: (
    <g stroke="#C23E34" strokeWidth="2.4" fill="none" strokeLinecap="round">
      <circle cx="67" cy="115" r="6" />
      <path d="m72 120 4 4" />
    </g>
  ),
  book: (
    <g stroke="#2575A0" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M63 112h14v12H63z" />
      <path d="M70 112v12" />
    </g>
  ),
  wrench: (
    <g stroke="#A14C2C" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M75 110a4 4 0 0 1-5 5l-7 7 3 3 7-7a4 4 0 0 1 5-5l-2 2-3-3z" />
    </g>
  ),
  shield: (
    <g stroke="#3D5F8A" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M70 109l-7 3v6c0 4 3 7 7 8 4-1 7-4 7-8v-6l-7-3z" />
      <path d="M67 118l2 2 4-4" />
    </g>
  ),
  scroll: (
    <g stroke="#1A7468" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M64 112h12a2 2 0 0 1 0 4H64a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H64" />
      <path d="M66 112v12" />
    </g>
  ),
}

export interface AgentDef {
  key: string
  name: string
  role: string
  engine: Engine
  trait: string
  /** System prompt de l'agent (couche persona du contexte 2 niveaux). */
  persona: string
  state: AgentState
  plumbob: PlumbobVariant
  task: string
  taskFile?: string
  avatar: {
    from: string
    to: string
    face: Face
    highlight?: boolean
    blush?: string
    arms?: string
    accessory: ReactNode
  }
}

export const AGENTS: Record<string, AgentDef> = {
  atlas: {
    key: 'atlas',
    name: 'Atlas',
    role: 'Architecte',
    engine: OPUS,
    trait: 'Perfectionniste',
    persona:
      "Tu es l'architecte de l'équipe. Tu reçois les objectifs, tu les décomposes en sous-tâches claires " +
      "et tu proposes une approche avant d'agir. Tu délègues l'implémentation aux agents spécialisés et " +
      "tu veilles à la cohérence globale plus qu'à la vitesse. Tu n'écris pas toi-même de gros volumes de " +
      "code : ton livrable, c'est un plan et des délégations.",
    state: 'working',
    plumbob: 'healthy',
    task: 'Planifie la migration vers la v2',
    taskFile: 'plan-v2.md',
    avatar: {
      from: '#E8C86D', to: '#A87D1A',
      face: 'happy', blush: 'rgba(200,160,40,.3)', arms: '#A87D1A',
      accessory: accessories.book,
    },
  },
  pixel: {
    key: 'pixel',
    name: 'Pixel',
    role: 'Frontend',
    engine: SONNET,
    trait: 'Prudent',
    persona:
      "Tu construis des interfaces propres et accessibles. Tu respectes strictement les design tokens du " +
      "projet (aucune valeur en dur), tu vérifies le rendu, et tu avances par petites étapes vérifiables. " +
      "Tu préfères demander qu'inventer quand le design est ambigu.",
    state: 'working',
    plumbob: 'healthy',
    task: 'Édite Navbar.tsx — ajoute le menu mobile',
    taskFile: 'Navbar.tsx',
    avatar: {
      from: '#F4889E', to: '#D9476A',
      face: 'happy', blush: 'rgba(236,106,134,.35)', arms: '#D9476A',
      accessory: accessories.paintbrush,
    },
  },
  probe: {
    key: 'probe',
    name: 'Probe',
    role: 'Tests',
    engine: FLASH,
    trait: 'Rapide',
    persona:
      "Tu écris et lances des tests. Tu traques les cas limites, tu rapportes clairement ce qui casse, " +
      "et tu proposes des correctifs minimes. Première passe rapide, puis tu approfondis si nécessaire.",
    state: 'blocked',
    plumbob: 'blocked',
    task: '3 tests échouent dans auth.spec.ts',
    taskFile: 'auth.spec.ts',
    avatar: {
      from: '#F7C463', to: '#D98A18',
      face: 'worried',
      accessory: accessories.magnifier,
    },
  },
  sentinel: {
    key: 'sentinel',
    name: 'Sentinel',
    role: 'Sécurité',
    engine: SONNET,
    trait: 'Prudent',
    persona:
      "Tu audites le code : vulnérabilités, secrets exposés, mauvaises pratiques. Tu ne modifies rien " +
      "sans validation ; tu produis un rapport priorisé par sévérité, sans noyer sous les faux positifs.",
    state: 'sleeping',
    plumbob: 'sleeping',
    task: 'Endormi — audit sur demande',
    avatar: {
      from: '#8FADD4', to: '#3D5F8A',
      face: 'sleepy', highlight: false,
      accessory: accessories.shield,
    },
  },
  scribe: {
    key: 'scribe',
    name: 'Scribe',
    role: 'Documentation',
    engine: FLASH,
    trait: 'Économe',
    persona:
      "Tu rédiges et tiens à jour la documentation (README, changelog, commentaires utiles). " +
      "Tu écris clair et concis, sans jargon inutile, au coût le plus bas.",
    state: 'sleeping',
    plumbob: 'sleeping',
    task: 'Endormi — doc sur demande',
    avatar: {
      from: '#7BD5C8', to: '#1E8C7F',
      face: 'sleepy', highlight: false,
      accessory: accessories.scroll,
    },
  },
  forge: {
    key: 'forge',
    name: 'Forge',
    role: 'DevOps',
    engine: SONNET,
    trait: 'Prudent',
    persona:
      "Tu gères CI/CD, dépendances et configuration. Toute commande à effet de bord passe par une " +
      "demande de permission. Tu privilégies la reproductibilité sur la rapidité.",
    state: 'permission',
    plumbob: 'attention',
    task: 'Demande la permission de lancer : git push origin main',
    taskFile: 'git push origin main',
    avatar: {
      from: '#F2A07A', to: '#C85F3F',
      face: 'happy',
      accessory: accessories.wrench,
    },
  },
}

export const STATE_CHIP: Record<AgentState, { label: string; dot: string; pulse?: boolean }> = {
  working:    { label: 'Au travail',        dot: 'var(--healthy)',   pulse: true },
  permission: { label: 'Permission requise', dot: 'var(--attention)' },
  blocked:    { label: 'Bloqué',             dot: 'var(--blocked)'   },
  sleeping:   { label: 'Endormi',            dot: 'var(--pending)'   },
}
