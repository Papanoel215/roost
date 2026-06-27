import { useSyncExternalStore } from 'react'
import { AGENTS, type AgentDef, type AgentState } from '../data/agents'

export interface AgentRuntimeState {
  state: AgentState
  task: string
  taskFile?: string
}

export interface ActivityLog {
  id: string
  time: string
  text: string
}

const runtimeStates: Record<string, AgentRuntimeState> = {}
let logs: ActivityLog[] = []

// Initialize with the static default states defined in data/agents
for (const key of Object.keys(AGENTS)) {
  runtimeStates[key] = {
    state: AGENTS[key].state,
    task: AGENTS[key].task,
    taskFile: AGENTS[key].taskFile,
  }
}

// Initial default log
logs.push({
  id: 'init',
  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  text: "Studio de commande Roost initialisé en mode Lofi local."
})

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function addLog(text: string) {
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logs = [{ id: Math.random().toString(), time, text }, ...logs].slice(0, 35)
  emit()
}

export function updateAgentState(key: string, updates: Partial<AgentRuntimeState>) {
  if (runtimeStates[key]) {
    const prevState = runtimeStates[key].state
    runtimeStates[key] = { ...runtimeStates[key], ...updates }
    
    // Log details of the update
    const name = AGENTS[key].name
    if (updates.state && updates.state !== prevState) {
      const stateLabels: Record<string, string> = {
        working: 'se met au travail',
        sleeping: 's\'endort',
        permission: 'demande une permission',
        blocked: 'est bloqué(e)'
      }
      addLog(`[${name}] ${stateLabels[updates.state]} : "${updates.task || runtimeStates[key].task}"`)
    } else if (updates.task && updates.task !== runtimeStates[key].task) {
      addLog(`[${name}] tâche mise à jour : "${updates.task}"`)
    }
    
    emit()
  }
}

export function getAgentRuntimeState(key: string): AgentRuntimeState {
  return runtimeStates[key] || { state: 'sleeping', task: 'Endormi' }
}

export function useAgentRuntimeState(key: string): AgentRuntimeState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => getAgentRuntimeState(key),
    () => getAgentRuntimeState(key)
  )
}

export function useAllAgentsRuntimeStates(): Record<string, AgentRuntimeState> {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => runtimeStates,
    () => runtimeStates
  )
}

export function useActivityLogs(): ActivityLog[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => logs,
    () => logs
  )
}
