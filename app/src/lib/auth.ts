import { useSyncExternalStore } from 'react'
import { setProfile, refreshUserSession } from './store'

export type Provider = 'email' | 'google' | 'facebook' | 'apple'
export interface Account { email: string; name: string; provider: Provider; pass?: string }
export interface Session { email: string; name: string; provider: Provider }

const LS_ACC = 'roost.accounts'
const LS_SESSION = 'roost.session'

function loadAccounts(): Record<string, Account> {
  try { return JSON.parse(localStorage.getItem(LS_ACC) || '{}') } catch { return {} }
}
function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || 'null') } catch { return null }
}

let accounts = loadAccounts()
let session: Session | null = loadSession()
const subs = new Set<() => void>()

const saveAccounts = () => { try { localStorage.setItem(LS_ACC, JSON.stringify(accounts)) } catch { /* noop */ } }
const saveSession = () => { try { session ? localStorage.setItem(LS_SESSION, JSON.stringify(session)) : localStorage.removeItem(LS_SESSION) } catch { /* noop */ } }
const emit = () => subs.forEach((f) => f())

// Hash léger, non cryptographique — suffisant pour ce prototype local (pas un vrai service).
function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return String(h >>> 0)
}

function start(a: Account) {
  session = { email: a.email, name: a.name, provider: a.provider }
  saveSession()
  refreshUserSession()
  setProfile({ name: a.name })
  emit()
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function signUpEmail(name: string, email: string, password: string): { ok: boolean; error?: string } {
  email = email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Email invalide' }
  if (password.length < 6) return { ok: false, error: 'Mot de passe : 6 caractères minimum' }
  if (accounts[email]) return { ok: false, error: 'Un compte existe déjà avec cet email' }
  accounts[email] = { email, name: name.trim() || email.split('@')[0], provider: 'email', pass: hash(password) }
  saveAccounts()
  start(accounts[email])
  return { ok: true }
}

export function signInEmail(email: string, password: string): { ok: boolean; error?: string } {
  email = email.trim().toLowerCase()
  const a = accounts[email]
  if (!a || a.provider !== 'email') return { ok: false, error: 'Aucun compte avec cet email' }
  if (a.pass !== hash(password)) return { ok: false, error: 'Mot de passe incorrect' }
  start(a)
  return { ok: true }
}

export function signInProvider(provider: 'google' | 'facebook' | 'apple', email: string, name: string) {
  email = email.trim().toLowerCase()
  if (!accounts[email]) {
    accounts[email] = { email, name: name.trim() || email.split('@')[0], provider }
    saveAccounts()
  }
  start(accounts[email])
}

export function signOut() {
  session = null
  saveSession()
  refreshUserSession()
  emit()
}

export const getSession = () => session
export function useSession(): Session | null {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb) } }, () => session, () => session)
}
