import { AGENTS } from '../data/agents'

const ROOST_RULES =
  "Tu fais partie de l'équipe Roost, un studio d'agents IA. " +
  "Réponds en français, de façon concrète et concise. " +
  "Ton livrable doit être directement exploitable."

const TRAIT_GUIDANCE: Record<string, string> = {
  'Prudent': "Avance par petites étapes vérifiables, écris/lance des tests, ne sors jamais du périmètre sans le signaler.",
  'Rapide': "Va droit au but, livre vite une première version fonctionnelle, explications brèves.",
  'Économe': "Choisis la solution la plus simple et la moins coûteuse, évite les détours.",
  'Perfectionniste': "Relis, refactore si besoin, ajoute une étape de revue avant de conclure.",
}

export function buildSystemContext(agentKey: string, workspaceDesc?: string): string {
  const agent = AGENTS[agentKey]
  if (!agent) return ROOST_RULES

  const workspacePart = workspaceDesc
    ? `\n\nContexte du projet : ${workspaceDesc}`
    : ''

  const traitPart = TRAIT_GUIDANCE[agent.trait]
    ? `\n\n${TRAIT_GUIDANCE[agent.trait]}`
    : ''

  const personaPart = agent.persona
    ? `\n\n${agent.persona}`
    : `\n\nTu es ${agent.name}, l'agent ${agent.role} de l'équipe.`

  return ROOST_RULES + workspacePart + personaPart + traitPart
}
