import { useSyncExternalStore } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentStats {
  agentKey: string
  level: number
  xp: number
  xpToNext: number
  totalXp: number
  totalRuns: number
  successfulRuns: number
  coins: number
  badges: string[]
  streak: number
  specialtyLevel: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: number
  agentKey?: string
}

export interface GamificationState {
  agents: Record<string, AgentStats>
  globalCoins: number
  globalXp: number
  totalMissions: number
  achievements: Achievement[]
  dailyBonusClaimed: string
}

// ---------------------------------------------------------------------------
// Level system
// ---------------------------------------------------------------------------

// Total XP needed to reach level N: N*80 + N*N*20
function totalXpForLevel(n: number): number {
  return n * 80 + n * n * 20
}

// Build XP_PER_LEVEL as thresholds array up to level 100
// Index i = total XP needed to be at level i
export const XP_PER_LEVEL: number[] = Array.from({ length: 101 }, (_, i) =>
  i === 0 ? 0 : totalXpForLevel(i)
)

function getLevelFromTotalXp(totalXp: number): { level: number; xp: number; xpToNext: number } {
  let level = 1
  for (let n = 1; n <= 99; n++) {
    if (totalXp >= totalXpForLevel(n + 1)) {
      level = n + 1
    } else {
      break
    }
  }
  level = Math.max(1, Math.min(100, level))
  const floorXp = totalXpForLevel(level)
  const ceilXp = level < 100 ? totalXpForLevel(level + 1) : totalXpForLevel(level) + 999_999
  const xp = totalXp - floorXp
  const xpToNext = ceilXp - floorXp
  return { level, xp, xpToNext }
}

// ---------------------------------------------------------------------------
// Achievements catalogue
// ---------------------------------------------------------------------------

interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_blood',    title: 'Premier Sang',        description: 'Effectue ton premier run',                     icon: '🩸' },
  { id: 'serial_runner',  title: 'Serial Runner',        description: '10 runs effectués',                            icon: '🏃' },
  { id: 'century',        title: 'Centurion',            description: '100 runs effectués',                           icon: '💯' },
  { id: 'perfectionist',  title: 'Perfectionniste',      description: '10 succès consécutifs',                        icon: '✨' },
  { id: 'night_owl',      title: 'Oiseau de Nuit',       description: 'Run effectué après minuit',                    icon: '🦉' },
  { id: 'speedster',      title: 'Speedster',            description: 'Run terminé en moins de 5 secondes',           icon: '⚡' },
  { id: 'marathon',       title: 'Marathonien',          description: 'Run de plus de 60 secondes',                   icon: '🏅' },
  { id: 'multi_tasker',   title: 'Multi-Tâche',          description: '3 agents actifs simultanément',                icon: '🔀' },
  { id: 'coin_collector', title: 'Collectionneur',       description: '500 coins accumulés',                          icon: '🪙' },
  { id: 'veteran',        title: 'Vétéran',              description: 'Un agent atteint le niveau 10',                icon: '🎖️' },
  { id: 'elite',          title: 'Élite',                description: 'Un agent atteint le niveau 25',                icon: '🏆' },
  { id: 'legend',         title: 'Légende',              description: 'Un agent atteint le niveau 50',                icon: '👑' },
  { id: 'atlas_fan',      title: 'Fan d\'Atlas',         description: '10 runs avec atlas',                           icon: '🗺️' },
  { id: 'pixel_fan',      title: 'Fan de Pixel',         description: '10 runs avec pixel',                           icon: '🎨' },
  { id: 'probe_fan',      title: 'Fan de Probe',         description: '10 runs avec probe',                           icon: '🔬' },
  { id: 'sentinel_fan',   title: 'Fan de Sentinel',      description: '10 runs avec sentinel',                        icon: '🛡️' },
  { id: 'scribe_fan',     title: 'Fan de Scribe',        description: '10 runs avec scribe',                          icon: '📝' },
  { id: 'forge_fan',      title: 'Fan de Forge',         description: '10 runs avec forge',                           icon: '⚒️' },
  { id: 'big_spender',    title: 'Grand Dépensier',      description: '1000 coins dépensés',                          icon: '💸' },
  { id: 'daily_player',   title: 'Joueur Quotidien',     description: 'Bonus quotidien réclamé 7 fois',               icon: '📅' },
]

// ---------------------------------------------------------------------------
// Default agent stats factory
// ---------------------------------------------------------------------------

function makeDefaultStats(agentKey: string): AgentStats {
  return {
    agentKey,
    level: 1,
    xp: 0,
    xpToNext: totalXpForLevel(2) - totalXpForLevel(1),
    totalXp: 0,
    totalRuns: 0,
    successfulRuns: 0,
    coins: 0,
    badges: [],
    streak: 0,
    specialtyLevel: 1,
  }
}

// ---------------------------------------------------------------------------
// Default GamificationState
// ---------------------------------------------------------------------------

const DEFAULT_STATE: GamificationState = {
  agents: {},
  globalCoins: 0,
  globalXp: 0,
  totalMissions: 0,
  achievements: [],
  dailyBonusClaimed: '',
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const LS_KEY = 'roost.gamification'

function loadState(): GamificationState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<GamificationState>
    return {
      agents: parsed.agents ?? {},
      globalCoins: parsed.globalCoins ?? 0,
      globalXp: parsed.globalXp ?? 0,
      totalMissions: parsed.totalMissions ?? 0,
      achievements: parsed.achievements ?? [],
      dailyBonusClaimed: parsed.dailyBonusClaimed ?? '',
    }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(s: GamificationState): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch { /* quota */ }
}

// ---------------------------------------------------------------------------
// Store internals
// ---------------------------------------------------------------------------

let state: GamificationState = loadState()
const subs = new Set<() => void>()

function commit(next: GamificationState): void {
  state = next
  saveState(next)
  subs.forEach((f) => f())
}

function subscribe(cb: () => void): () => void {
  subs.add(cb)
  return () => { subs.delete(cb) }
}

function getState(): GamificationState { return state }

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useGamification(): GamificationState {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function useAgentStats(agentKey: string): AgentStats {
  const gs = useSyncExternalStore(subscribe, getState, getState)
  return gs.agents[agentKey] ?? makeDefaultStats(agentKey)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureAgent(s: GamificationState, agentKey: string): GamificationState {
  if (s.agents[agentKey]) return s
  return {
    ...s,
    agents: { ...s.agents, [agentKey]: makeDefaultStats(agentKey) },
  }
}

function applyXpToAgent(stats: AgentStats, xpGain: number): AgentStats {
  const newTotalXp = stats.totalXp + xpGain
  const { level, xp, xpToNext } = getLevelFromTotalXp(newTotalXp)
  const specialtyLevel = Math.min(5, 1 + Math.floor((level - 1) / 10))
  return { ...stats, totalXp: newTotalXp, level, xp, xpToNext, specialtyLevel }
}

function hasAchievement(s: GamificationState, id: string): boolean {
  return s.achievements.some((a) => a.id === id)
}

function unlockAchievement(
  s: GamificationState,
  id: string,
  agentKey?: string,
): { state: GamificationState; achievement: Achievement | null } {
  if (hasAchievement(s, id)) return { state: s, achievement: null }
  const def = ACHIEVEMENT_DEFS.find((d) => d.id === id)
  if (!def) return { state: s, achievement: null }
  const achievement: Achievement = {
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: Date.now(),
    agentKey,
  }
  return {
    state: { ...s, achievements: [...s.achievements, achievement] },
    achievement,
  }
}

function tryUnlock(
  s: GamificationState,
  id: string,
  condition: boolean,
  agentKey?: string,
  newUnlocks: Achievement[] = [],
): { state: GamificationState; newUnlocks: Achievement[] } {
  if (!condition) return { state: s, newUnlocks }
  const { state: next, achievement } = unlockAchievement(s, id, agentKey)
  if (achievement) newUnlocks = [...newUnlocks, achievement]
  return { state: next, newUnlocks }
}

// ---------------------------------------------------------------------------
// Daily bonus claims counter (stored inside achievements as a lightweight counter)
// ---------------------------------------------------------------------------

function getDailyBonusClaimCount(s: GamificationState): number {
  // We embed the count in the achievement id suffix once unlocked
  // Simpler: just count how many times dailyBonusClaimed was reset historically
  // We'll store a separate field via a hidden property in globalXp — actually
  // use a separate key in localStorage for simplicity
  try {
    return parseInt(localStorage.getItem('roost.gamification.dailyClaims') ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function incrementDailyBonusClaimCount(): number {
  const next = getDailyBonusClaimCount(state) + 1
  try { localStorage.setItem('roost.gamification.dailyClaims', String(next)) } catch {}
  return next
}

// ---------------------------------------------------------------------------
// Core: recordRun
// ---------------------------------------------------------------------------

export function recordRun(
  agentKey: string,
  run: { status: 'success' | 'error'; durationMs?: number },
): Achievement[] {
  let s = ensureAgent(state, agentKey)
  const agent = { ...s.agents[agentKey] }
  const isSuccess = run.status === 'success'
  const durationMs = run.durationMs ?? 0
  const newUnlocks: Achievement[] = []

  // Update streak
  const streak = isSuccess ? agent.streak + 1 : 0

  // Compute XP gain
  let xpGain: number
  if (isSuccess) {
    const base = Math.min(200, 50 + Math.floor(durationMs / 1000) * 2)
    const bonus = streak * 5
    xpGain = base + bonus
  } else {
    xpGain = 10
  }

  // Compute coins
  const coinsGain = isSuccess ? Math.min(50, 10 + agent.level * 2) : 0

  // Apply XP to agent
  const updatedAgent = applyXpToAgent(
    {
      ...agent,
      totalRuns: agent.totalRuns + 1,
      successfulRuns: isSuccess ? agent.successfulRuns + 1 : agent.successfulRuns,
      coins: agent.coins + coinsGain,
      streak,
    },
    xpGain,
  )

  s = {
    ...s,
    agents: { ...s.agents, [agentKey]: updatedAgent },
    globalCoins: s.globalCoins + coinsGain,
    globalXp: s.globalXp + xpGain,
    totalMissions: s.totalMissions + 1,
  }

  // Check night owl
  const hour = new Date().getHours()
  const isNightOwl = hour >= 0 && hour < 5

  // Evaluate achievements
  const totalRuns = s.totalMissions
  const agentRuns = updatedAgent.totalRuns
  const level = updatedAgent.level

  const checks: Array<[string, boolean, string | undefined]> = [
    ['first_blood',    totalRuns === 1,                                  undefined],
    ['serial_runner',  totalRuns >= 10,                                  undefined],
    ['century',        totalRuns >= 100,                                 undefined],
    ['perfectionist',  updatedAgent.streak >= 10,                        agentKey],
    ['night_owl',      isNightOwl && isSuccess,                          undefined],
    ['speedster',      isSuccess && durationMs > 0 && durationMs < 5000, agentKey],
    ['marathon',       isSuccess && durationMs > 60_000,                 agentKey],
    ['coin_collector', s.globalCoins >= 500,                             undefined],
    ['veteran',        level >= 10,                                      agentKey],
    ['elite',          level >= 25,                                      agentKey],
    ['legend',         level >= 50,                                      agentKey],
    ['atlas_fan',      agentKey === 'atlas'    && agentRuns >= 10,       agentKey],
    ['pixel_fan',      agentKey === 'pixel'    && agentRuns >= 10,       agentKey],
    ['probe_fan',      agentKey === 'probe'    && agentRuns >= 10,       agentKey],
    ['sentinel_fan',   agentKey === 'sentinel' && agentRuns >= 10,       agentKey],
    ['scribe_fan',     agentKey === 'scribe'   && agentRuns >= 10,       agentKey],
    ['forge_fan',      agentKey === 'forge'    && agentRuns >= 10,       agentKey],
  ]

  let collector = { state: s, newUnlocks }
  for (const [id, cond, ak] of checks) {
    const result = tryUnlock(collector.state, id, cond, ak, collector.newUnlocks)
    collector = result
  }

  commit(collector.state)
  return collector.newUnlocks
}

// ---------------------------------------------------------------------------
// claimDailyBonus
// ---------------------------------------------------------------------------

export function claimDailyBonus(): { coins: number; xp: number } | null {
  const today = new Date().toISOString().slice(0, 10)
  if (state.dailyBonusClaimed === today) return null

  const coins = 50
  const xp = 100

  const claimCount = incrementDailyBonusClaimCount()

  let s: GamificationState = {
    ...state,
    globalCoins: state.globalCoins + coins,
    globalXp: state.globalXp + xp,
    dailyBonusClaimed: today,
  }

  // Check daily_player (7+ claims)
  const { state: next, achievement } = unlockAchievement(
    s,
    'daily_player',
    undefined,
  )
  if (achievement && claimCount >= 7) {
    s = next
  } else {
    // Only unlock if threshold reached
    const r = tryUnlock(s, 'daily_player', claimCount >= 7, undefined, [])
    s = r.state
  }

  commit(s)
  return { coins, xp }
}

// ---------------------------------------------------------------------------
// spendCoins
// ---------------------------------------------------------------------------

let totalSpent = 0

export function spendCoins(amount: number): boolean {
  if (state.globalCoins < amount) return false

  totalSpent += amount

  let s: GamificationState = {
    ...state,
    globalCoins: state.globalCoins - amount,
  }

  // Check big_spender
  const r = tryUnlock(s, 'big_spender', totalSpent >= 1000, undefined, [])
  s = r.state

  commit(s)
  return true
}
