import { getSettings } from './store'
import type { ChatMsg } from './types'

export type { ChatMsg }
export type Provider = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'xai'
export interface TestResult { ok: boolean; error?: string }

// ---------------------------------------------------------------------------
// Base URLs
// ---------------------------------------------------------------------------

const ANTHROPIC = 'https://api.anthropic.com/v1'
const OPENAI = 'https://api.openai.com/v1'
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta'
const GROQ = 'https://api.groq.com/openai/v1'
const XAI = 'https://api.x.ai/v1'

// ---------------------------------------------------------------------------
// Models registry
// ---------------------------------------------------------------------------

export interface ModelDef {
  id: string
  label: string
  provider: Provider
  contextWindow: number
  supportsVision: boolean
}

export const MODELS: ModelDef[] = [
  // Anthropic
  { id: 'claude-opus-4-8',             label: 'Claude Opus 4.8',          provider: 'anthropic', contextWindow: 200000, supportsVision: true },
  { id: 'claude-sonnet-4-6',           label: 'Claude Sonnet 4.6',        provider: 'anthropic', contextWindow: 200000, supportsVision: true },
  { id: 'claude-haiku-4-5-20251001',   label: 'Claude Haiku 4.5',         provider: 'anthropic', contextWindow: 200000, supportsVision: true },
  // OpenAI
  { id: 'gpt-4o',                      label: 'GPT-4o',                   provider: 'openai',    contextWindow: 128000, supportsVision: true },
  { id: 'gpt-4o-mini',                 label: 'GPT-4o Mini',              provider: 'openai',    contextWindow: 128000, supportsVision: true },
  { id: 'o1-mini',                     label: 'o1 Mini',                  provider: 'openai',    contextWindow:  65536, supportsVision: false },
  { id: 'gpt-4-turbo',                 label: 'GPT-4 Turbo',              provider: 'openai',    contextWindow: 128000, supportsVision: true },
  // Google Gemini
  { id: 'gemini-2.0-flash',            label: 'Gemini 2.0 Flash',         provider: 'gemini',    contextWindow: 1048576, supportsVision: true },
  { id: 'gemini-1.5-pro',              label: 'Gemini 1.5 Pro',           provider: 'gemini',    contextWindow: 2097152, supportsVision: true },
  { id: 'gemini-1.5-flash',            label: 'Gemini 1.5 Flash',         provider: 'gemini',    contextWindow: 1048576, supportsVision: true },
  // Groq
  { id: 'llama-3.3-70b-versatile',     label: 'Llama 3.3 70B',            provider: 'groq',      contextWindow: 128000, supportsVision: false },
  { id: 'llama-3.1-8b-instant',        label: 'Llama 3.1 8B Instant',     provider: 'groq',      contextWindow: 131072, supportsVision: false },
  { id: 'mixtral-8x7b-32768',          label: 'Mixtral 8x7B',             provider: 'groq',      contextWindow:  32768, supportsVision: false },
  // xAI Grok
  { id: 'grok-beta',                   label: 'Grok Beta',                provider: 'xai',       contextWindow: 131072, supportsVision: false },
  { id: 'grok-2-mini',                 label: 'Grok 2 Mini',              provider: 'xai',       contextWindow: 131072, supportsVision: false },
]

export function getProvider(modelId: string): Provider {
  const found = MODELS.find((m) => m.id === modelId)
  if (found) return found.provider
  // Heuristic fallback
  if (modelId.startsWith('claude')) return 'anthropic'
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) return 'openai'
  if (modelId.startsWith('gemini')) return 'gemini'
  if (modelId.startsWith('llama') || modelId.startsWith('mixtral') || modelId.startsWith('whisper')) return 'groq'
  if (modelId.startsWith('grok')) return 'xai'
  return 'anthropic'
}

// ---------------------------------------------------------------------------
// Utility: rough token count estimate
// ---------------------------------------------------------------------------

export function countTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// ---------------------------------------------------------------------------
// Provider-specific headers
// ---------------------------------------------------------------------------

const anthropicHeaders = (key: string) => ({
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
  'content-type': 'application/json',
})

const bearerHeaders = (key: string) => ({
  'authorization': `Bearer ${key}`,
  'content-type': 'application/json',
})

// ---------------------------------------------------------------------------
// Key resolver
// ---------------------------------------------------------------------------

function getKey(provider: Provider): string {
  const keys = getSettings().keys as Record<string, string>
  return keys[provider] || ''
}

// ---------------------------------------------------------------------------
// testKey — validate an API key for any provider
// ---------------------------------------------------------------------------

export async function testKey(provider: Provider, key: string): Promise<TestResult> {
  if (!key.trim()) return { ok: false, error: 'Clé vide' }
  try {
    if (provider === 'anthropic') {
      const res = await fetch(`${ANTHROPIC}/models`, { headers: anthropicHeaders(key) })
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
    if (provider === 'gemini') {
      const res = await fetch(`${GEMINI}/models?key=${encodeURIComponent(key)}`)
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
    if (provider === 'openai') {
      const res = await fetch(`${OPENAI}/models`, { headers: bearerHeaders(key) })
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
    if (provider === 'groq') {
      const res = await fetch(`${GROQ}/models`, { headers: bearerHeaders(key) })
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
    if (provider === 'xai') {
      const res = await fetch(`${XAI}/models`, { headers: bearerHeaders(key) })
      if (res.ok) return { ok: true }
      const j = await res.json().catch(() => ({}))
      return { ok: false, error: j?.error?.message || `HTTP ${res.status}` }
    }
    return { ok: false, error: 'Provider inconnu' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur réseau' }
  }
}

// ---------------------------------------------------------------------------
// Multi-provider message type (new streamChat API)
// ---------------------------------------------------------------------------

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export type StreamMessage = {
  role: 'user' | 'assistant'
  content: string | ContentPart[]
}

export interface StreamChatOptions {
  model: string
  messages: StreamMessage[]
  systemPrompt?: string
  onChunk: (text: string) => void
  onDone: (fullText: string, usage?: { inputTokens: number; outputTokens: number }) => void
  onError: (err: Error) => void
  signal?: AbortSignal
}

// ---------------------------------------------------------------------------
// SSE reader helper (OpenAI-compatible: data: {...} or data: [DONE])
// ---------------------------------------------------------------------------

async function readOpenAIStream(
  res: Response,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number }> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let fullText = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    for (;;) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') break
        try {
          const ev = JSON.parse(data)
          const delta = ev?.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            onChunk(delta)
          }
          // Capture usage when available (stream_options.include_usage)
          if (ev?.usage) {
            inputTokens = ev.usage.prompt_tokens ?? 0
            outputTokens = ev.usage.completion_tokens ?? 0
          }
        } catch { /* ignore malformed SSE */ }
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }

  return { fullText, inputTokens, outputTokens }
}

// ---------------------------------------------------------------------------
// SSE reader helper (Anthropic)
// ---------------------------------------------------------------------------

async function readAnthropicStream(
  res: Response,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number }> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let fullText = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    for (;;) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') break
        try {
          const ev = JSON.parse(data)
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
            fullText += ev.delta.text
            onChunk(ev.delta.text)
          }
          if (ev.type === 'message_delta' && ev.usage) {
            outputTokens = ev.usage.output_tokens ?? 0
          }
          if (ev.type === 'message_start' && ev.message?.usage) {
            inputTokens = ev.message.usage.input_tokens ?? 0
          }
        } catch { /* ignore malformed SSE */ }
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }

  return { fullText, inputTokens, outputTokens }
}

// ---------------------------------------------------------------------------
// SSE reader helper (Gemini)
// ---------------------------------------------------------------------------

async function readGeminiStream(
  res: Response,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number }> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let fullText = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    for (;;) {
      if (signal?.aborted) break
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
          if (text) {
            fullText += text
            onChunk(text)
          }
          if (ev?.usageMetadata) {
            inputTokens = ev.usageMetadata.promptTokenCount ?? inputTokens
            outputTokens = ev.usageMetadata.candidatesTokenCount ?? outputTokens
          }
        } catch { /* ignore */ }
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }

  return { fullText, inputTokens, outputTokens }
}

// ---------------------------------------------------------------------------
// Gemini message conversion
// ---------------------------------------------------------------------------

function toGeminiContents(messages: StreamMessage[]): Array<{ role: string; parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> }> {
  return messages.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user'
    if (typeof m.content === 'string') {
      return { role, parts: [{ text: m.content }] }
    }
    const parts = m.content.map((part) => {
      if (part.type === 'text') return { text: part.text }
      // image_url: expect data URIs like data:image/png;base64,...
      const url = part.image_url.url
      const match = url.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        return { inline_data: { mime_type: match[1], data: match[2] } }
      }
      return { text: `[image: ${url}]` }
    })
    return { role, parts }
  })
}

// ---------------------------------------------------------------------------
// OpenAI-compatible message conversion (OpenAI, Groq, xAI)
// ---------------------------------------------------------------------------

function toOpenAIMessages(
  messages: StreamMessage[],
  systemPrompt?: string,
): Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> {
  const result: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = []
  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt })
  }
  for (const m of messages) {
    if (typeof m.content === 'string') {
      result.push({ role: m.role, content: m.content })
    } else {
      result.push({ role: m.role, content: m.content.map((p) => {
        if (p.type === 'text') return { type: 'text', text: p.text }
        return { type: 'image_url', image_url: p.image_url }
      }) })
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// New streamChat (multi-provider, callback-based)
// ---------------------------------------------------------------------------

export async function streamChat(options: StreamChatOptions): Promise<void>

// Legacy overload — kept for backward compatibility with existing callers using
// streamChat(provider, model, system, messages, onToken, signal)
export async function streamChat(
  providerOrOptions: Provider | StreamChatOptions,
  model?: string,
  system?: string,
  messages?: ChatMsg[],
  onToken?: (token: string) => void,
  signal?: AbortSignal,
): Promise<void>

export async function streamChat(
  providerOrOptions: Provider | StreamChatOptions,
  model?: string,
  system?: string,
  messages?: ChatMsg[],
  onToken?: (token: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  // Detect which overload was used
  if (typeof providerOrOptions === 'object' && providerOrOptions !== null && 'model' in providerOrOptions) {
    // New callback-based API
    return _streamChatNew(providerOrOptions)
  }

  // Legacy API: streamChat(provider, model, system, messages, onToken, signal)
  const provider = providerOrOptions as Provider
  const msgs: StreamMessage[] = (messages ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  return _streamChatNew({
    model: model!,
    messages: msgs,
    systemPrompt: system,
    onChunk: onToken ?? (() => {}),
    onDone: () => {},
    onError: (e) => { throw e },
    signal,
  })
}

async function _streamChatNew(opts: StreamChatOptions): Promise<void> {
  const { model, messages, systemPrompt, onChunk, onDone, onError, signal } = opts
  const provider = getProvider(model)
  try {
    if (provider === 'anthropic') {
      await _streamAnthropic(model, messages, systemPrompt, onChunk, onDone, signal)
    } else if (provider === 'gemini') {
      await _streamGemini(model, messages, systemPrompt, onChunk, onDone, signal)
    } else {
      // OpenAI-compatible: openai, groq, xai
      await _streamOpenAICompat(provider, model, messages, systemPrompt, onChunk, onDone, signal)
    }
  } catch (e) {
    onError(e instanceof Error ? e : new Error(String(e)))
  }
}

async function _streamAnthropic(
  model: string,
  messages: StreamMessage[],
  systemPrompt: string | undefined,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { inputTokens: number; outputTokens: number }) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = getKey('anthropic')
  if (!key) throw new Error('NO_KEY')

  // Convert StreamMessage to Anthropic format
  const anthropicMessages = messages.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content }
    }
    // Multi-part content
    const content = m.content.map((p) => {
      if (p.type === 'text') return { type: 'text', text: p.text }
      // image_url
      const url = (p as { type: 'image_url'; image_url: { url: string } }).image_url.url
      const match = url.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        return { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } }
      }
      return { type: 'text', text: `[image: ${url}]` }
    })
    return { role: m.role, content }
  })

  const body: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    messages: anthropicMessages,
    stream: true,
  }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j?.error?.message || `HTTP ${res.status}`)
  }

  const { fullText, inputTokens, outputTokens } = await readAnthropicStream(res, onChunk, signal)
  onDone(fullText, { inputTokens, outputTokens })
}

async function _streamGemini(
  model: string,
  messages: StreamMessage[],
  systemPrompt: string | undefined,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { inputTokens: number; outputTokens: number }) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = getKey('gemini')
  if (!key) throw new Error('NO_KEY')

  const contents = toGeminiContents(messages)
  const body: Record<string, unknown> = { contents }
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] }

  const res = await fetch(
    `${GEMINI}/models/${model}:streamGenerateContent?key=${encodeURIComponent(key)}&alt=sse`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    },
  )

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j?.error?.message || `HTTP ${res.status}`)
  }

  const { fullText, inputTokens, outputTokens } = await readGeminiStream(res, onChunk, signal)
  onDone(fullText, { inputTokens, outputTokens })
}

async function _streamOpenAICompat(
  provider: 'openai' | 'groq' | 'xai',
  model: string,
  messages: StreamMessage[],
  systemPrompt: string | undefined,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { inputTokens: number; outputTokens: number }) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = getKey(provider)
  if (!key) throw new Error('NO_KEY')

  const baseUrl = provider === 'openai' ? OPENAI : provider === 'groq' ? GROQ : XAI

  // o1 models don't support streaming or system prompt in the same way
  const isO1 = model.startsWith('o1') || model.startsWith('o3')
  const oaiMessages = toOpenAIMessages(messages, isO1 ? undefined : systemPrompt)
  if (isO1 && systemPrompt) {
    // o1 uses 'developer' role for instructions
    oaiMessages.unshift({ role: 'developer', content: systemPrompt })
  }

  const body: Record<string, unknown> = {
    model,
    messages: oaiMessages,
    stream: true,
    stream_options: { include_usage: true },
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: bearerHeaders(key),
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j?.error?.message || `HTTP ${res.status}`)
  }

  const { fullText, inputTokens, outputTokens } = await readOpenAIStream(res, onChunk, signal)
  onDone(fullText, { inputTokens, outputTokens })
}

// ---------------------------------------------------------------------------
// Non-streaming agentChat (legacy, kept for callers)
// ---------------------------------------------------------------------------

async function chatAnthropic(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = getKey('anthropic')
  if (!key) throw new Error('NO_KEY')
  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify({ model, max_tokens: 4096, system, messages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  return (j.content || []).map((b: { text?: string }) => b.text || '').join('') || '(réponse vide)'
}

async function chatGemini(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = getKey('gemini')
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

async function chatOpenAICompat(provider: 'openai' | 'groq' | 'xai', model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = getKey(provider)
  if (!key) throw new Error('NO_KEY')
  const baseUrl = provider === 'openai' ? OPENAI : provider === 'groq' ? GROQ : XAI
  const oaiMessages = [
    { role: 'system', content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: bearerHeaders(key),
    body: JSON.stringify({ model, messages: oaiMessages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  return j?.choices?.[0]?.message?.content || '(réponse vide)'
}

export function agentChat(provider: Provider, model: string, system: string, messages: ChatMsg[]): Promise<string> {
  if (provider === 'gemini') return chatGemini(model, system, messages)
  if (provider === 'openai' || provider === 'groq' || provider === 'xai') return chatOpenAICompat(provider, model, system, messages)
  return chatAnthropic(model, system, messages)
}

// ---------------------------------------------------------------------------
// Mission execution (non-streaming, returns token counts)
// ---------------------------------------------------------------------------

export interface AgentResult { text: string; inputTokens: number; outputTokens: number }

async function runAgentAnthropic(model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  const key = getKey('anthropic')
  if (!key) throw new Error('NO_KEY')
  const res = await fetch(`${ANTHROPIC}/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
    body: JSON.stringify({ model, max_tokens: 4096, system, messages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  const text = (j.content || []).map((b: { text?: string }) => b.text || '').join('') || '(réponse vide)'
  return { text, inputTokens: j?.usage?.input_tokens ?? 0, outputTokens: j?.usage?.output_tokens ?? 0 }
}

async function runAgentGemini(model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  const key = getKey('gemini')
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

async function runAgentOpenAICompat(provider: 'openai' | 'groq' | 'xai', model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  const key = getKey(provider)
  if (!key) throw new Error('NO_KEY')
  const baseUrl = provider === 'openai' ? OPENAI : provider === 'groq' ? GROQ : XAI
  const oaiMessages = [
    { role: 'system', content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: bearerHeaders(key),
    body: JSON.stringify({ model, messages: oaiMessages }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j?.error?.message || `HTTP ${res.status}`)
  const text = j?.choices?.[0]?.message?.content || '(réponse vide)'
  return {
    text,
    inputTokens: j?.usage?.prompt_tokens ?? 0,
    outputTokens: j?.usage?.completion_tokens ?? 0,
  }
}

export function runAgent(provider: Provider, model: string, system: string, messages: ChatMsg[]): Promise<AgentResult> {
  if (provider === 'gemini') return runAgentGemini(model, system, messages)
  if (provider === 'openai' || provider === 'groq' || provider === 'xai') return runAgentOpenAICompat(provider, model, system, messages)
  return runAgentAnthropic(model, system, messages)
}
