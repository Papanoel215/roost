import { useSyncExternalStore } from 'react'
import type { ChatMsg } from './types'

export interface Settings {
  profile: { name: string; handle: string; timezone: string; bio: string }
  keys: { anthropic: string; gemini: string }
  tested: { anthropic: boolean; gemini: boolean }
  notif: { push: boolean; perms: boolean; email: boolean; weekly: boolean }
  mfa: boolean
}

const DEFAULT: Settings = {
  profile: { name: 'Maxime', handle: '@maxime', timezone: 'Europe/Paris', bio: "Maker solo qui pilote une équipe d'agents." },
  keys: { anthropic: '', gemini: '' },
  tested: { anthropic: false, gemini: false },
  notif: { push: true, perms: true, email: false, weekly: true },
  mfa: false,
}

const LS = 'roost.settings'

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(LS) || '{}')
    return {
      profile: { ...DEFAULT.profile, ...(raw.profile || {}) },
      keys: { ...DEFAULT.keys, ...(raw.keys || {}) },
      tested: { ...DEFAULT.tested, ...(raw.tested || {}) },
      notif: { ...DEFAULT.notif, ...(raw.notif || {}) },
      mfa: typeof raw.mfa === 'boolean' ? raw.mfa : DEFAULT.mfa,
    }
  } catch {
    return DEFAULT
  }
}

let state: Settings = load()
const subs = new Set<() => void>()

function commit(next: Settings) {
  state = next
  try { localStorage.setItem(LS, JSON.stringify(state)) } catch { /* quota / private mode */ }
  subs.forEach((f) => f())
}

export const getSettings = () => state
export const setProfile = (p: Partial<Settings['profile']>) => commit({ ...state, profile: { ...state.profile, ...p } })
export const setKey = (provider: 'anthropic' | 'gemini', value: string) =>
  commit({ ...state, keys: { ...state.keys, [provider]: value }, tested: { ...state.tested, [provider]: false } })
export const setTested = (provider: 'anthropic' | 'gemini', val: boolean) =>
  commit({ ...state, tested: { ...state.tested, [provider]: val } })
export const setNotif = (p: Partial<Settings['notif']>) => commit({ ...state, notif: { ...state.notif, ...p } })
export const setMfa = (v: boolean) => commit({ ...state, mfa: v })

function subscribe(cb: () => void) {
  subs.add(cb)
  return () => { subs.delete(cb) }
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings)
}

// ---------------------------------------------------------------------------
// Conversations store
// ---------------------------------------------------------------------------

export interface StoredConversation {
  id: string
  agentKey: string
  title: string
  messages: ChatMsg[]
  updatedAt: number
}

const LS_CONVOS = 'roost.conversations'

function loadConvos(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(LS_CONVOS)
    return raw ? (JSON.parse(raw) as StoredConversation[]) : []
  } catch { return [] }
}

function saveConvosLS(data: StoredConversation[]) {
  try { localStorage.setItem(LS_CONVOS, JSON.stringify(data)) } catch {}
}

let convosState: StoredConversation[] = loadConvos()
const convosSubs = new Set<() => void>()

function commitConvos(next: StoredConversation[]) {
  convosState = next
  saveConvosLS(next)
  convosSubs.forEach((f) => f())
}

export function useConversations(): StoredConversation[] {
  return useSyncExternalStore(
    (cb) => { convosSubs.add(cb); return () => convosSubs.delete(cb) },
    () => convosState,
    () => convosState,
  )
}

export function upsertConversation(conv: StoredConversation): void {
  const idx = convosState.findIndex((c) => c.id === conv.id)
  if (idx >= 0) {
    const next = [...convosState]
    next[idx] = conv
    commitConvos(next)
  } else {
    commitConvos([conv, ...convosState])
  }
}

export function getLatestConversationForAgent(agentKey: string): StoredConversation | undefined {
  return [...convosState]
    .filter((c) => c.agentKey === agentKey)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]
}
