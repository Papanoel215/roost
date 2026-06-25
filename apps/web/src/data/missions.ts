export type Column = 'Backlog' | 'En file' | 'En cours' | 'À réviser' | 'Fait'
export type Priority = 'Basse' | 'Moyenne' | 'Haute'

export interface Mission {
  id: string
  title: string
  agent: string
  column: Column
  priority: Priority
  needsReview?: boolean
  cost?: string
}

export const COLUMNS: Column[] = ['Backlog', 'En file', 'En cours', 'À réviser', 'Fait']

export const PRIORITY_COLOR: Record<Priority, string> = {
  Basse: 'var(--pending)',
  Moyenne: 'var(--vital-energy)',
  Haute: 'var(--blocked)',
}

export const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1',  title: 'Refondre la navbar responsive + a11y',       agent: 'pixel',    column: 'En cours',   priority: 'Haute',   cost: '0,18 $' },
  { id: 'm2',  title: 'Planifier la migration vers la v2',           agent: 'atlas',    column: 'En cours',   priority: 'Moyenne', cost: '0,22 $' },
  { id: 'm3',  title: 'Pipeline CI : cache pnpm + déploiement',      agent: 'forge',    column: 'En file',    priority: 'Moyenne' },
  { id: 'm4',  title: 'Corriger 3 tests cassés (auth.spec.ts)',       agent: 'probe',    column: 'À réviser',  priority: 'Haute',   needsReview: true, cost: '0,09 $' },
  { id: 'm5',  title: 'Documenter l’API de facturation',         agent: 'scribe',   column: 'Backlog',    priority: 'Basse' },
  { id: 'm6',  title: 'Extraire un composant Button réutilisable',    agent: 'pixel',    column: 'À réviser',  priority: 'Moyenne', needsReview: true, cost: '0,12 $' },
  { id: 'm7',  title: 'Audit dépendances (npm audit) + correctifs',   agent: 'sentinel', column: 'Backlog',    priority: 'Haute' },
  { id: 'm8',  title: 'Mettre à jour le changelog v0.3',              agent: 'scribe',   column: 'Fait',       priority: 'Basse',   cost: '0,04 $' },
  { id: 'm9',  title: 'Audit sécurité rate-limiting sur /api/runs',   agent: 'sentinel', column: 'Fait',       priority: 'Moyenne', cost: '0,15 $' },
  { id: 'm10', title: 'Tests e2e du parcours d’onboarding',      agent: 'probe',    column: 'En file',    priority: 'Moyenne' },
  { id: 'm11', title: 'Snapshot + rollback du workspace',             agent: 'forge',    column: 'Backlog',    priority: 'Basse' },
]
