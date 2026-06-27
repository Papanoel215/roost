import { useSyncExternalStore } from 'react'
import type { ChatMsg } from './types'

export interface Settings {
  profile: { name: string; handle: string; timezone: string; bio: string }
  keys: { anthropic: string; openai: string; gemini: string; groq: string; xai: string }
  tested: { anthropic: boolean; openai: boolean; gemini: boolean; groq: boolean; xai: boolean }
  notif: { push: boolean; perms: boolean; email: boolean; weekly: boolean }
  mfa: boolean
  soundEnabled: boolean
  musicEnabled: boolean
}

const DEFAULT: Settings = {
  profile: { name: 'Maxime', handle: '@maxime', timezone: 'Europe/Paris', bio: "Maker solo qui pilote une équipe d'agents." },
  keys: { anthropic: '', openai: '', gemini: '', groq: '', xai: '' },
  tested: { anthropic: false, openai: false, gemini: false, groq: false, xai: false },
  notif: { push: true, perms: true, email: false, weekly: true },
  mfa: false,
  soundEnabled: true,
  musicEnabled: false,
}

function getCurrentUserEmail(): string {
  try {
    const sess = JSON.parse(localStorage.getItem('roost.session') || 'null')
    return sess?.email || 'default'
  } catch {
    return 'default'
  }
}

function load(): Settings {
  const email = getCurrentUserEmail()
  const key = `roost.settings.${email}`
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '{}')
    return {
      profile: { ...DEFAULT.profile, ...(raw.profile || {}) },
      keys: { ...DEFAULT.keys, ...(raw.keys || {}) },
      tested: { ...DEFAULT.tested, ...(raw.tested || {}) },
      notif: { ...DEFAULT.notif, ...(raw.notif || {}) },
      mfa: typeof raw.mfa === 'boolean' ? raw.mfa : DEFAULT.mfa,
      soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : DEFAULT.soundEnabled,
      musicEnabled: typeof raw.musicEnabled === 'boolean' ? raw.musicEnabled : DEFAULT.musicEnabled,
    }
  } catch {
    return DEFAULT
  }
}

let state: Settings = load()
const subs = new Set<() => void>()

function commit(next: Settings) {
  state = next
  const email = getCurrentUserEmail()
  const key = `roost.settings.${email}`
  try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* quota / private mode */ }
  subs.forEach((f) => f())
}

export const getSettings = () => state
export const setProfile = (p: Partial<Settings['profile']>) => commit({ ...state, profile: { ...state.profile, ...p } })
export const setKey = (provider: 'anthropic' | 'openai' | 'gemini' | 'groq' | 'xai', value: string) =>
  commit({ ...state, keys: { ...state.keys, [provider]: value }, tested: { ...state.tested, [provider]: false } })
export const setTested = (provider: 'anthropic' | 'openai' | 'gemini' | 'groq' | 'xai', val: boolean) =>
  commit({ ...state, tested: { ...state.tested, [provider]: val } })
export const setNotif = (p: Partial<Settings['notif']>) => commit({ ...state, notif: { ...state.notif, ...p } })
export const setMfa = (v: boolean) => commit({ ...state, mfa: v })
export const setSoundPrefs = (prefs: { soundEnabled: boolean; musicEnabled: boolean }) =>
  commit({ ...state, soundEnabled: prefs.soundEnabled, musicEnabled: prefs.musicEnabled })

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

function loadConvos(): StoredConversation[] {
  const email = getCurrentUserEmail()
  const key = `roost.conversations.${email}`
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as StoredConversation[]) : []
  } catch { return [] }
}

function saveConvosLS(data: StoredConversation[]) {
  const email = getCurrentUserEmail()
  const key = `roost.conversations.${email}`
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

let convosState: StoredConversation[] = loadConvos()
const convosSubs = new Set<() => void>()

function commitConvos(next: StoredConversation[]) {
  convosState = next
  saveConvosLS(next)
  convosSubs.forEach((f) => f())
}

export function refreshUserSession() {
  state = load()
  convosState = loadConvos()
  subs.forEach((f) => f())
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
