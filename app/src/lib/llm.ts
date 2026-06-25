import { getSettings } from './store'
import type { ChatMsg } from './types'

export type { ChatMsg }
export type Provider = 'anthropic' | 'gemini'
export interface TestResult { ok: boolean; error?: string }

const ANTHROPIC = 'https://api.anthropic.com/v1'
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta'

const anthropicHeaders = (key: string) => ({
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
  'content-type': 'application/json',
})

export async function testKey(provider: Provider, key: string): Promise<TestResult> {
  if (!key.trim()) return { ok: false, error: 'Clé vide' }
  try {
    if (provider === 'anthropic') {
      const res = await fetch(`${ANTHROPIC}/models`, { headers: anthropicHeaders(key) })
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    } else {
      const res = await fetch(`${GEMINI}/models?key=${encodeURIComponent(key)}`)
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur réseau' }
  }
}

// ---------------------------------------------------------------------------
// Non-streaming chat (kept for fallback / runAgent)
// ---------------------------------------------------------------------------

async function chatAnthropic(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = getSettings().keys.anthropic
  if (!key) throw new Error('NO_KEY')
  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify({ model, max_tokens: 1024, system, messages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  return (j.content || []).map((b: { text?: string }) => b.text || '').join('') || '(réponse vide)'
}

async function chatGemini(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = getSettings().keys.gemini
  if (!key) throw new Error('NO_KEY')
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const res = await fetch(`${GEMINI}/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  return (j.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('') || '(réponse vide)'
}

export function agentChat(provider: Provider, model: string, system: string, messages: ChatMsg[]): Promise<string> {
  return provider === 'gemini' ? chatGemini(model, system, messages) : chatAnthropic(model, system, messages)
}

// ---------------------------------------------------------------------------
// SSE streaming chat
// ---------------------------------------------------------------------------

export async function streamChat(
  provider: Provider,
  model: string,
  system: string,
  messages: ChatMsg[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (provider === 'gemini') {
    return streamGemini(model, system, messages, onToken, signal)
  }
  return streamAnthropic(model, system, messages, onToken, signal)
}

async function streamAnthropic(
  model: string,
  system: string,
  messages: ChatMsg[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = getSettings().keys.anthropic
  if (!key) throw new Error('NO_KEY')

  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify({ model, max_tokens: 1024, system, messages, stream: true }),
    signal,
  })

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j?.error?.message || `HTTP ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const ev = JSON.parse(data)
        if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
          onToken(ev.delta.text)
        }
      } catch { /* ignore malformed SSE */ }
    }
  }
}

async function streamGemini(
  model: string,
  system: string,
  messages: ChatMsg[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = getSettings().keys.gemini
  if (!key) throw new Error('NO_KEY')

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `${GEMINI}/models/${model}:streamGenerateContent?key=${encodeURIComponent(key)}&alt=sse`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
      signal,
    },
  )

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j?.error?.message || `HTTP ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      try {
        const ev = JSON.parse(data)
        const text = (ev?.candidates?.[0]?.content?.parts ?? [])
          .map((p: { text?: string }) => p.text ?? '')
          .join('')
        if (text) onToken(text)
      } catch { /* ignore */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Mission execution (non-streaming, returns token counts)
// ---------------------------------------------------------------------------

export interface AgentResult { text: string; inputTokens: number; outputTokens: number }

async function runAgentAnthropic(model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  const key = getSettings().keys.anthropic
  if (!key) throw new Error('NO_KEY')
  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify({ model, max_tokens: 1024, system, messages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  const text = (j.content || []).map((b: { text?: string }) => b.text || '').join('') || '(réponse vide)'
  return { text, inputTokens: j?.usage?.input_tokens ?? 0, outputTokens: j?.usage?.output_tokens ?? 0 }
}

async function runAgentGemini(model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  const key = getSettings().keys.gemini
  if (!key) throw new Error('NO_KEY')
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const res = await fetch(`${GEMINI}/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  const text = (j.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('') || '(réponse vide)'
  return { text, inputTokens: j?.usageMetadata?.promptTokenCount ?? 0, outputTokens: j?.usageMetadata?.candidatesTokenCount ?? 0 }
}

export function runAgent(provider: Provider, model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  return provider === 'gemini' ? runAgentGemini(model, system, messages) : runAgentAnthropic(model, system, messages)
}
