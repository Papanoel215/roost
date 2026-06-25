import { useState, useEffect } from 'react'
import { signIn, signOut as nextSignOut, getSession as nextGetSession } from 'next-auth/react'
import { refreshUserSession } from './store'

export type Provider = 'email' | 'google' | 'facebook' | 'apple'
export interface Session { email: string; name: string; provider: Provider }

let activeSession: Session | null = null
const subs = new Set<() => void>()

const emit = () => subs.forEach((f) => f())

export async function signUpEmail(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { ok: false, error: data.error || 'Erreur lors de la création du compte' }
    }
    // Connecte directement après inscription
    return await signInEmail(email, password)
  } catch (err) {
    return { ok: false, error: 'Erreur réseau' }
  }
}

export async function signInEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      return { ok: false, error: result.error }
    }
    await checkSession()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: 'Erreur réseau' }
  }
}

export async function signInProvider(provider: 'google' | 'facebook' | 'apple', email: string, name: string) {
  try {
    const res = await fetch('/api/auth/social-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, provider }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error(data.error)
      return
    }
    
    // Connecte via NextAuth credentials avec le mot de passe social dédié
    await signIn('credentials', {
      email,
      password: `social-pass-${provider}`,
      redirect: false,
    })
    await checkSession()
  } catch (err) {
    console.error('Social sign-in error:', err)
  }
}

export async function signOut() {
  await nextSignOut({ redirect: false })
  activeSession = null
  refreshUserSession()
  emit()
}

export const getSession = () => activeSession

async function checkSession() {
  const nextSession = await nextGetSession()
  if (nextSession?.user) {
    activeSession = {
      email: nextSession.user.email || '',
      name: nextSession.user.name || '',
      provider: nextSession.user.email?.includes('gmail.com') ? 'google' : 'email'
    }
  } else {
    activeSession = null
  }
  refreshUserSession()
  emit()
}

// Premier check de la session au démarrage
if (typeof window !== 'undefined') {
  checkSession()
}

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(activeSession)

  useEffect(() => {
    setSession(activeSession)
    const cb = () => setSession(activeSession)
    subs.add(cb)
    return () => {
      subs.delete(cb)
    }
  }, [])

  return session
}
