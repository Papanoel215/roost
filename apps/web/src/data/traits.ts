export interface Trait {
  key: string
  label: string
  emoji: string
  model: string
  permission: 'ASK' | 'AUTO'
  maxTurns: number
  blurb: string
}

export const TRAITS: Trait[] = [
  { key: 'prudent', label: 'Prudent', emoji: '🧭', model: 'fort (Sonnet / Opus)', permission: 'ASK', maxTurns: 30, blurb: 'Avance par petites étapes vérifiables, écrit des tests, ne sort jamais du périmètre sans le signaler.' },
  { key: 'rapide', label: 'Rapide', emoji: '⚡', model: 'Flash / Haiku', permission: 'AUTO', maxTurns: 20, blurb: 'Va droit au but, livre vite une première version fonctionnelle, explications brèves.' },
  { key: 'econome', label: 'Économe', emoji: '🍃', model: 'le moins cher capable', permission: 'ASK', maxTurns: 25, blurb: 'Choisit la solution la plus simple et la moins coûteuse, évite les détours.' },
  { key: 'perfectionniste', label: 'Perfectionniste', emoji: '✨', model: 'fort (Opus)', permission: 'ASK', maxTurns: 50, blurb: 'Relit, refactore si besoin, ajoute une étape de revue avant de conclure.' },
]

export const ENGINES = [
  { key: 'claude', label: 'Claude', models: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5'] },
  { key: 'gemini', label: 'Gemini', models: ['gemini-3-pro', 'gemini-3.5-flash'] },
]

export const MCP_SKILLS = ['GitHub', 'Linear', 'Slack', 'Postgres', 'Figma', 'Sentry', 'Notion', 'Vercel']
