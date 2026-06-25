import { useSyncExternalStore } from 'react'
import { AGENTS } from '../data/agents'
import { INITIAL_MISSIONS } from '../data/missions'
import type { Column, Priority } from '../data/missions'
import { runAgent } from './llm'

// Re-export for convenience
export type { Column, Priority } from '../data/missions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Mission {
  id: string
  title: string
  agentKey: string
  column: Column
  priority: Priority
  needsReview?: boolean
  cost?: string
  createdAt: number
}

export interface Run {
  id: string
  missionId: string
  agentKey: string
  title: string
  status: 'running' | 'success' | 'failed'
  output?: string
  error?: string
  inputTokens?: number
  outputTokens?: number
  cost?: string
  durationMs?: number
  createdAt: number
}

export interface AuditEntry {
  id: string
  actor: string
  actorAgentKey?: string
  type: 'approval' | 'permission' | 'spend' | 'config' | 'run'
  action: string
  target?: string
  at: number
}

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------

const LS_MISSIONS = 'roost.missions'
const LS_RUNS = 'roost.runs'
const LS_AUDIT = 'roost.audit'

// ---------------------------------------------------------------------------
// Cost computation
// ---------------------------------------------------------------------------

// Rates in USD per 1 million tokens [input, output]
function getRates(model: string): [number, number] {
  if (model.includes('opus')) return [15, 75]
  if (model.includes('haiku')) return [0.8, 4]
  if (model.includes('gemini')) return [0.3, 1.2]
  // sonnet is the default
  return [3, 15]
}

function computeCost(model: string, inputTokens: number, outputTokens: number): string {
  const [inRate, outRate] = getRates(model)
  const usd = (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate
  // Format as French decimal: "0,XX $"
  return usd.toFixed(2).replace('.', ',') + ' $'
}

// ---------------------------------------------------------------------------
// Missions store
// ---------------------------------------------------------------------------

function seedMissions(): Mission[] {
  return INITIAL_MISSIONS.map((m, i) => ({
    id: m.id,
    title: m.title,
    agentKey: m.agent,
    column: m.column,
    priority: m.priority,
    needsReview: m.needsReview,
    cost: m.cost,
    createdAt: Date.now() - (INITIAL_MISSIONS.length - i) * 1000,
  }))
}

function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(LS_MISSIONS)
    if (!raw) return seedMissions()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return seedMissions()
    return parsed as Mission[]
  } catch {
    return seedMissions()
  }
}

function saveMissions(data: Mission[]) {
  try { localStorage.setItem(LS_MISSIONS, JSON.stringify(data)) } catch { /* quota / private mode */ }
}

let missionsState: Mission[] = loadMissions()
const missionsSubs = new Set<() => void>()

function commitMissions(next: Mission[]) {
  missionsState = next
  saveMissions(next)
  missionsSubs.forEach((f) => f())
}

function subscribeMissions(cb: () => void) {
  missionsSubs.add(cb)
  return () => { missionsSubs.delete(cb) }
}

function getMissions() { return missionsState }

export function useMissions(): Mission[] {
  return useSyncExternalStore(subscribeMissions, getMissions, getMissions)
}

export function createMission(input: { title: string; agentKey: string; priority: Priority; column?: Column }): Mission {
  const mission: Mission = {
    id: 'm' + Date.now(),
    title: input.title,
    agentKey: input.agentKey,
    column: input.column ?? 'En file',
    priority: input.priority,
    createdAt: Date.now(),
  }
  commitMissions([...missionsState, mission])
  logAudit({ actor: 'Système', type: 'config', action: 'mission créée', target: mission.title })
  return mission
}

export function moveMission(id: string, column: Column): void {
  commitMissions(missionsState.map((m) => m.id === id ? { ...m, column } : m))
}

export function deleteMission(id: string): void {
  const mission = missionsState.find((m) => m.id === id)
  commitMissions(missionsState.filter((m) => m.id !== id))
  if (mission) {
    logAudit({ actor: 'Système', type: 'config', action: 'mission supprimée', target: mission.title })
  }
}

// ---------------------------------------------------------------------------
// Runs store
// ---------------------------------------------------------------------------

function loadRuns(): Run[] {
  try {
    const raw = localStorage.getItem(LS_RUNS)
    if (!raw) return []
    return JSON.parse(raw) as Run[]
  } catch {
    return []
  }
}

function saveRuns(data: Run[]) {
  try { localStorage.setItem(LS_RUNS, JSON.stringify(data)) } catch { /* quota / private mode */ }
}

let runsState: Run[] = loadRuns()
const runsSubs = new Set<() => void>()

function commitRuns(next: Run[]) {
  runsState = next
  saveRuns(next)
  runsSubs.forEach((f) => f())
}

function subscribeRuns(cb: () => void) {
  runsSubs.add(cb)
  return () => { runsSubs.delete(cb) }
}

function getRuns() { return runsState }

export function useRuns(): Run[] {
  return useSyncExternalStore(subscribeRuns, getRuns, getRuns)
}

// ---------------------------------------------------------------------------
// Audit store
// ---------------------------------------------------------------------------

function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(LS_AUDIT)
    if (!raw) return []
    return JSON.parse(raw) as AuditEntry[]
  } catch {
    return []
  }
}

function saveAudit(data: AuditEntry[]) {
  try { localStorage.setItem(LS_AUDIT, JSON.stringify(data)) } catch { /* quota / private mode */ }
}

let auditState: AuditEntry[] = loadAudit()
const auditSubs = new Set<() => void>()

function commitAudit(next: AuditEntry[]) {
  auditState = next
  saveAudit(next)
  auditSubs.forEach((f) => f())
}

function subscribeAudit(cb: () => void) {
  auditSubs.add(cb)
  return () => { auditSubs.delete(cb) }
}

function getAudit() { return auditState }

export function useAudit(): AuditEntry[] {
  return useSyncExternalStore(subscribeAudit, getAudit, getAudit)
}

export function logAudit(e: Omit<AuditEntry, 'id' | 'at'>): void {
  const entry: AuditEntry = {
    ...e,
    id: 'a' + Date.now() + Math.random().toString(36).slice(2, 7),
    at: Date.now(),
  }
  // Prepend — newest first
  commitAudit([entry, ...auditState])
}

// ---------------------------------------------------------------------------
// Mission execution engine
// ---------------------------------------------------------------------------

export async function runMission(missionId: string): Promise<void> {
  const mission = missionsState.find((m) => m.id === missionId)
  if (!mission) throw new Error(`Mission introuvable: ${missionId}`)

  const agent = AGENTS[mission.agentKey]
  if (!agent) throw new Error(`Agent introuvable: ${mission.agentKey}`)

  // Set mission to in-progress
  commitMissions(missionsState.map((m) =>
    m.id === missionId ? { ...m, column: 'En cours' as Column } : m
  ))

  // Create a running Run record
  const runId = 'r' + Date.now()
  const run: Run = {
    id: runId,
    missionId,
    agentKey: mission.agentKey,
    title: mission.title,
    status: 'running',
    createdAt: Date.now(),
  }
  commitRuns([...runsState, run])

  // Audit: mission launched
  logAudit({
    actor: agent.name,
    actorAgentKey: mission.agentKey,
    type: 'run',
    action: 'a lancé la mission',
    target: mission.title,
  })

  const system =
    `Tu es ${agent.name}, l'agent ${agent.role} de l'équipe Roost (trait ${agent.trait}). ` +
    `Exécute la tâche demandée et rends un résultat concret en français.`

  const startMs = Date.now()

  try {
    const result = await runAgent(
      agent.engine.kind,
      agent.engine.model,
      system,
      [{ role: 'user', content: mission.title }],
    )

    const durationMs = Date.now() - startMs
    const cost = computeCost(agent.engine.model, result.inputTokens, result.outputTokens)

    // Update run to success
    commitRuns(runsState.map((r) =>
      r.id === runId
        ? {
            ...r,
            status: 'success' as const,
            output: result.text,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            cost,
            durationMs,
          }
        : r
    ))

    // Set mission to review
    commitMissions(missionsState.map((m) =>
      m.id === missionId
        ? { ...m, column: 'À réviser' as Column, needsReview: true, cost }
        : m
    ))

    // Audit: run complete
    logAudit({
      actor: agent.name,
      actorAgentKey: mission.agentKey,
      type: 'run',
      action: 'run terminé',
      target: mission.title,
    })

    // Audit: spend
    logAudit({
      actor: agent.name,
      actorAgentKey: mission.agentKey,
      type: 'spend',
      action: `coût de la mission: ${cost}`,
      target: mission.title,
    })
  } catch (err) {
    const durationMs = Date.now() - startMs
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'

    // Update run to failed
    commitRuns(runsState.map((r) =>
      r.id === runId
        ? { ...r, status: 'failed' as const, error: errorMsg, durationMs }
        : r
    ))

    // Revert mission to queue
    commitMissions(missionsState.map((m) =>
      m.id === missionId ? { ...m, column: 'En file' as Column } : m
    ))

    // Audit: failure
    logAudit({
      actor: agent.name,
      actorAgentKey: mission.agentKey,
      type: 'run',
      action: `run échoué: ${errorMsg}`,
      target: mission.title,
    })
  }
}
