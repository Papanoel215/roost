import { useEffect, useRef, useState, useCallback } from 'react'
import { AGENTS } from '../data/agents'
import { useSettings } from '../lib/store'
import { streamChat } from '../lib/llm'
import type { ChatMsg } from '../lib/types'
import { buildSystemContext } from '../lib/context'
import { getLatestConversationForAgent, upsertConversation } from '../lib/store'
import { updateAgentState } from '../lib/agentState'
import type { Provider, ModelDef, StreamMessage } from '../lib/llm'
import { MODELS, countTokens } from '../lib/llm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageAttachment {
  dataUrl: string
  mimeType: string
  name: string
}

interface RichChatMsg {
  role: 'user' | 'assistant'
  content: string
  images?: ImageAttachment[]
  timestamp: number
}

// Ambient declarations for Web Speech API (not always present in DOM lib for Electron)
declare class SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}
interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}
interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
}

// ---------------------------------------------------------------------------
// Provider color palette
// ---------------------------------------------------------------------------

const PROVIDER_COLORS: Record<Provider, { bg: string; glow: string; label: string; text: string }> = {
  anthropic: { bg: '#0D9488', glow: 'rgba(13,148,136,0.45)', label: 'Anthropic', text: '#fff' },
  openai:    { bg: '#10A37F', glow: 'rgba(16,163,127,0.45)', label: 'OpenAI',    text: '#fff' },
  gemini:    { bg: '#4285F4', glow: 'rgba(66,133,244,0.45)', label: 'Gemini',    text: '#fff' },
  groq:      { bg: '#F97316', glow: 'rgba(249,115,22,0.45)',  label: 'Groq',      text: '#fff' },
  xai:       { bg: '#7C3AED', glow: 'rgba(124,58,237,0.45)', label: 'xAI',       text: '#fff' },
}

// ---------------------------------------------------------------------------
// Markdown renderer (no library — regex-based)
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): React.ReactNode[] {
  // Split into code blocks vs regular text
  const segments = text.split(/(```[\s\S]*?```)/g)
  const nodes: React.ReactNode[] = []

  segments.forEach((seg, si) => {
    if (seg.startsWith('```')) {
      // Code block
      const firstNewline = seg.indexOf('\n')
      const lang = firstNewline > 3 ? seg.slice(3, firstNewline).trim() : ''
      const code = firstNewline > -1 ? seg.slice(firstNewline + 1, -3) : seg.slice(3, -3)
      nodes.push(<CodeBlock key={`cb-${si}`} code={code} lang={lang} />)
      return
    }

    // Split into lines for processing
    const lines = seg.split('\n')
    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      // Heading
      const h3 = line.match(/^### (.+)/)
      const h2 = line.match(/^## (.+)/)
      const h1 = line.match(/^# (.+)/)
      if (h3) { nodes.push(<div key={`h3-${si}-${i}`} style={{ fontWeight: 700, fontSize: 13, marginTop: 8, marginBottom: 2 }}>{inlineMarkdown(h3[1])}</div>); i++; continue }
      if (h2) { nodes.push(<div key={`h2-${si}-${i}`} style={{ fontWeight: 700, fontSize: 14, marginTop: 10, marginBottom: 3 }}>{inlineMarkdown(h2[1])}</div>); i++; continue }
      if (h1) { nodes.push(<div key={`h1-${si}-${i}`} style={{ fontWeight: 800, fontSize: 15, marginTop: 12, marginBottom: 4 }}>{inlineMarkdown(h1[1])}</div>); i++; continue }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        nodes.push(<hr key={`hr-${si}-${i}`} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />)
        i++; continue
      }

      // Bullet list
      if (/^[\s]*[-*+] /.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^[\s]*[-*+] /.test(lines[i])) {
          items.push(lines[i].replace(/^[\s]*[-*+] /, ''))
          i++
        }
        nodes.push(
          <ul key={`ul-${si}-${i}`} style={{ margin: '4px 0', paddingLeft: 18 }}>
            {items.map((it, ii) => <li key={ii} style={{ marginBottom: 2 }}>{inlineMarkdown(it)}</li>)}
          </ul>
        )
        continue
      }

      // Numbered list
      if (/^\d+\. /.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\. /, ''))
          i++
        }
        nodes.push(
          <ol key={`ol-${si}-${i}`} style={{ margin: '4px 0', paddingLeft: 20 }}>
            {items.map((it, ii) => <li key={ii} style={{ marginBottom: 2 }}>{inlineMarkdown(it)}</li>)}
          </ol>
        )
        continue
      }

      // Empty line = paragraph break
      if (line.trim() === '') {
        nodes.push(<div key={`br-${si}-${i}`} style={{ height: 6 }} />)
        i++; continue
      }

      // Regular paragraph
      nodes.push(<div key={`p-${si}-${i}`} style={{ marginBottom: 2 }}>{inlineMarkdown(line)}</div>)
      i++
    }
  })

  return nodes
}

function inlineMarkdown(text: string): React.ReactNode {
  // Process inline code, bold, italic
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.92em' }}>{part.slice(1, -1)}</code>
    }
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

// ---------------------------------------------------------------------------
// Code block with copy button
// ---------------------------------------------------------------------------

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ position: 'relative', margin: '8px 0', borderRadius: 10, overflow: 'hidden', background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)' }}>
      {lang && (
        <div style={{ padding: '4px 12px', background: '#161B22', fontSize: 10.5, color: '#8B949E', fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{lang}</span>
          <button onClick={copy} style={{ background: 'none', border: 'none', color: copied ? '#10A37F' : '#8B949E', cursor: 'pointer', fontSize: 10.5, padding: '0 2px' }}>
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      )}
      {!lang && (
        <button onClick={copy} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: copied ? '#10A37F' : '#8B949E', cursor: 'pointer', fontSize: 10, padding: '2px 8px', borderRadius: 5, zIndex: 1 }}>
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      )}
      <pre style={{ margin: 0, padding: '12px 14px', overflowX: 'auto', fontSize: 12, lineHeight: 1.6, color: '#E6EDF3', fontFamily: "'Fira Code', 'Consolas', monospace' " }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scanline CSS injector (gaming aesthetic)
// ---------------------------------------------------------------------------

const GLOBAL_STYLES = `
@keyframes roost-dot {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
@keyframes roost-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes roost-slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes roost-pulse-mic {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
  50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
}
.roost-msg-enter { animation: roost-slide-in 0.22s ease forwards; }
.roost-chat-bg {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.018) 2px,
    rgba(0,0,0,0.018) 4px
  );
}
.roost-input-focus:focus-within {
  border-color: var(--roost-accent) !important;
  box-shadow: 0 0 0 3px var(--roost-glow) !important;
}
`

function useInjectStyles() {
  useEffect(() => {
    const id = 'roost-chat-styles'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = GLOBAL_STYLES
    document.head.appendChild(el)
    return () => { document.getElementById(id)?.remove() }
  }, [])
}

// ---------------------------------------------------------------------------
// Model selector
// ---------------------------------------------------------------------------

const MODEL_STORAGE_KEY = 'roost.selectedModel'
const DEFAULT_MODEL = 'claude-sonnet-4-6'

function getStoredModel(): string {
  try { return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL } catch { return DEFAULT_MODEL }
}
function storeModel(id: string) {
  try { localStorage.setItem(MODEL_STORAGE_KEY, id) } catch {}
}

interface ModelSelectorProps {
  selectedModel: string
  onChange: (modelId: string) => void
  keys: { anthropic: string; openai: string; gemini: string; groq: string; xai: string }
}

function ModelSelector({ selectedModel, onChange, keys }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const availableModels = MODELS.filter((m) => {
    const k = keys as Record<string, string>
    return !!k[m.provider]
  })

  // Group by provider
  const grouped: Record<string, ModelDef[]> = {}
  for (const m of availableModels) {
    if (!grouped[m.provider]) grouped[m.provider] = []
    grouped[m.provider].push(m)
  }

  const current = MODELS.find((m) => m.id === selectedModel)
  const provider: Provider = current ? current.provider : 'anthropic'
  const pc = PROVIDER_COLORS[provider]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          borderRadius: 9, border: `1.5px solid ${pc.bg}`,
          background: 'rgba(0,0,0,0.35)', color: '#E0E0E0',
          cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
          boxShadow: open ? `0 0 10px ${pc.glow}` : 'none',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
      >
        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: pc.bg, boxShadow: `0 0 6px ${pc.glow}` }} />
        {current ? current.label : selectedModel}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 50,
          background: '#1A1D27', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, padding: '6px 0', minWidth: 210,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxHeight: 340, overflowY: 'auto',
        }}>
          {Object.entries(grouped).length === 0 && (
            <div style={{ padding: '10px 14px', fontSize: 11.5, color: '#888' }}>
              Aucune clé configurée — <a href="#/onboarding" style={{ color: '#0D9488' }}>Onboarding</a>
            </div>
          )}
          {Object.entries(grouped).map(([prov, models]) => {
            const pColor = PROVIDER_COLORS[prov as Provider]
            return (
              <div key={prov}>
                <div style={{ padding: '6px 12px 2px', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: pColor.bg, textTransform: 'uppercase' }}>
                  {pColor.label}
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onChange(m.id); storeModel(m.id); setOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 14px', border: 'none', textAlign: 'left',
                      background: m.id === selectedModel ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: m.id === selectedModel ? '#fff' : '#C0C0C0',
                      cursor: 'pointer', fontSize: 12,
                    }}
                  >
                    <span style={{ flex: 1 }}>{m.label}</span>
                    {m.supportsVision && <span style={{ fontSize: 9, color: '#666', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 4 }}>Vision</span>}
                    {m.id === selectedModel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={pColor.bg} strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ msg, isUser }: { msg: RichChatMsg; isUser: boolean }) {
  return (
    <div
      className="roost-msg-enter"
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '86%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Image thumbnails */}
      {msg.images && msg.images.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          {msg.images.map((img, ii) => (
            <img
              key={ii}
              src={img.dataUrl}
              alt={img.name}
              style={{ maxWidth: 180, maxHeight: 140, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', objectFit: 'cover' }}
            />
          ))}
        </div>
      )}

      {msg.content && (
        <div
          style={{
            borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.6,
            ...(isUser
              ? {
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  color: '#fff',
                  boxShadow: '0 3px 12px rgba(13,148,136,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
              : {
                  background: 'linear-gradient(135deg, #1E2130 0%, #252838 100%)',
                  color: '#E8E8F0',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }
            ),
          }}
        >
          {isUser
            ? <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            : <div>{renderMarkdown(msg.content)}</div>
          }
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Streaming bubble
// ---------------------------------------------------------------------------

function StreamingBubble({ text, agentName }: { text: string; agentName: string }) {
  return (
    <div
      className="roost-msg-enter"
      style={{
        alignSelf: 'flex-start',
        maxWidth: '86%',
        background: 'linear-gradient(135deg, #1E2130 0%, #252838 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '4px 16px 16px 16px',
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.6,
        color: '#E8E8F0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}
    >
      {text
        ? (
          <>
            {renderMarkdown(text)}
            <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#0D9488', marginLeft: 1, animation: 'roost-blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
          </>
        )
        : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#888' }}>
            <span style={{ fontSize: 12 }}>{agentName} réfléchit</span>
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#0D9488',
                  display: 'inline-block',
                  animation: `roost-dot 1.2s infinite ${d}ms`,
                }}
              />
            ))}
          </span>
        )
      }
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ChatPanel
// ---------------------------------------------------------------------------

export default function ChatPanel({ agentKey }: { agentKey: string }) {
  useInjectStyles()

  const agent = AGENTS[agentKey]
  const settings = useSettings()

  // Selected model — persisted
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const stored = getStoredModel()
    // Validate: if provider key is present, use it; else find first available
    const storedDef = MODELS.find((m) => m.id === stored)
    if (storedDef) {
      const k = settings.keys as Record<string, string>
      if (k[storedDef.provider]) return stored
    }
    const k = settings.keys as Record<string, string>
    const first = MODELS.find((m) => !!k[m.provider])
    return first?.id || DEFAULT_MODEL
  })

  const currentModelDef = MODELS.find((m) => m.id === selectedModel)
  const currentProvider: Provider = currentModelDef?.provider ?? 'anthropic'
  const providerColor = PROVIDER_COLORS[currentProvider]
  const supportsVision = currentModelDef?.supportsVision ?? false

  // Has at least one key
  const anyKey = Object.values(settings.keys).some((v) => !!v)
  // Has key for selected provider
  const k = settings.keys as Record<string, string>
  const hasKeyForModel = !!k[currentProvider]

  // Conversation state
  const [convId, setConvId] = useState<string>('')
  const [messages, setMessages] = useState<RichChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [tokenCount, setTokenCount] = useState(0)

  // Attachments
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Voice input
  const [listening, setListening] = useState(false)
  const speechRef = useRef<SpeechRecognition | null>(null)
  const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Web search toggle
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [searching, setSearching] = useState(false)

  // Scroll
  const endRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ---------------------------------------------------------------------------
  // Load conversation on agent change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const existing = getLatestConversationForAgent(agentKey)
    if (existing) {
      setConvId(existing.id)
      // Migrate legacy ChatMsg[] to RichChatMsg[]
      const rich: RichChatMsg[] = existing.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: Date.now(),
      }))
      setMessages(rich)
    } else {
      setConvId('conv_' + agentKey + '_' + Date.now())
      setMessages([])
    }
    setInput('')
    setError(null)
    setStreamingText('')
    setPendingImages([])
  }, [agentKey])

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Token counter
  useEffect(() => {
    const allText = messages.map((m) => m.content).join(' ')
    setTokenCount(countTokens(allText))
  }, [messages])

  // ---------------------------------------------------------------------------
  // Save helper
  // ---------------------------------------------------------------------------

  const save = useCallback((id: string, msgs: RichChatMsg[]) => {
    const legacyMsgs: ChatMsg[] = msgs.map((m) => ({ role: m.role, content: m.content }))
    upsertConversation({
      id,
      agentKey,
      title: msgs.find((m) => m.role === 'user')?.content.slice(0, 60) ?? agent.name,
      messages: legacyMsgs,
      updatedAt: Date.now(),
    })
  }, [agentKey, agent.name])

  // ---------------------------------------------------------------------------
  // Image handling
  // ---------------------------------------------------------------------------

  const readFileAsDataUrl = (file: File): Promise<ImageAttachment> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ dataUrl: reader.result as string, mimeType: file.type, name: file.name })
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return
    const imgs: ImageAttachment[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.type.startsWith('image/')) {
        try { imgs.push(await readFileAsDataUrl(f)) } catch {}
      }
    }
    if (imgs.length) setPendingImages((prev) => [...prev, ...imgs])
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!supportsVision) return
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter((it) => it.type.startsWith('image/'))
    if (imageItems.length === 0) return
    e.preventDefault()
    const imgs: ImageAttachment[] = []
    for (const item of imageItems) {
      const file = item.getAsFile()
      if (file) {
        try { imgs.push(await readFileAsDataUrl(file)) } catch {}
      }
    }
    if (imgs.length) setPendingImages((prev) => [...prev, ...imgs])
  }

  // ---------------------------------------------------------------------------
  // Voice input
  // ---------------------------------------------------------------------------

  const startListening = () => {
    if (!hasSpeech || listening) return
    const win = window as unknown as Record<string, unknown>
    const SR = (win.SpeechRecognition || win.webkitSpeechRecognition) as new () => SpeechRecognition
    const recognition = new SR()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    speechRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    speechRef.current?.stop()
    speechRef.current = null
    setListening(false)
  }

  // ---------------------------------------------------------------------------
  // Web search
  // ---------------------------------------------------------------------------

  const fetchWebContext = async (query: string): Promise<string> => {
    setSearching(true)
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
      const res = await fetch(url)
      if (!res.ok) return ''
      const data = await res.json()
      const parts: string[] = []
      if (data.AbstractText) parts.push(`Résumé : ${data.AbstractText}`)
      if (data.Answer) parts.push(`Réponse directe : ${data.Answer}`)
      if (data.RelatedTopics?.length) {
        const topics = data.RelatedTopics
          .slice(0, 4)
          .map((t: { Text?: string }) => t.Text)
          .filter(Boolean)
          .join('\n')
        if (topics) parts.push(`Sujets liés :\n${topics}`)
      }
      return parts.join('\n\n')
    } catch {
      return ''
    } finally {
      setSearching(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Export conversation
  // ---------------------------------------------------------------------------

  const exportConversation = () => {
    const lines: string[] = [`Conversation Roost — ${agent.name}`, `Modèle : ${selectedModel}`, `Exporté le : ${new Date().toLocaleString('fr-FR')}`, '---', '']
    for (const m of messages) {
      lines.push(`[${m.role === 'user' ? 'Vous' : agent.name}]`)
      lines.push(m.content)
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `roost-${agentKey}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // ---------------------------------------------------------------------------
  // Stop
  // ---------------------------------------------------------------------------

  const stop = () => { abortRef.current?.abort() }

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------

  const send = async () => {
    const text = input.trim()
    if ((!text && pendingImages.length === 0) || streaming) return
    setError(null)

    const images = [...pendingImages]
    setPendingImages([])

    const userMsg: RichChatMsg = {
      role: 'user',
      content: text,
      images: images.length ? images : undefined,
      timestamp: Date.now(),
    }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    updateAgentState(agentKey, {
      state: 'working',
      task: `Pense à : "${text.slice(0, 42)}${text.length > 42 ? '...' : ''}"`,
      taskFile: undefined,
    })

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const id = convId || ('conv_' + agentKey + '_' + Date.now())
    if (!convId) setConvId(id)

    // Build system prompt (optionally with web search)
    let systemPrompt = buildSystemContext(agentKey)
    if (webSearchEnabled && text) {
      const webCtx = await fetchWebContext(text)
      if (webCtx) {
        systemPrompt = `Résultats de recherche web actuels pour "${text}":\n${webCtx}\n\n---\n\n${systemPrompt}`
      }
    }

    // Build StreamMessage array
    const streamMessages: StreamMessage[] = withUser.map((m) => {
      if (m.images && m.images.length > 0) {
        const parts: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = []
        if (m.content) parts.push({ type: 'text', text: m.content })
        for (const img of m.images) parts.push({ type: 'image_url', image_url: { url: img.dataUrl } })
        return { role: m.role as 'user' | 'assistant', content: parts }
      }
      return { role: m.role as 'user' | 'assistant', content: m.content }
    })

    let accumulated = ''

    try {
      await streamChat({
        model: selectedModel,
        messages: streamMessages,
        systemPrompt,
        onChunk: (token) => {
          accumulated += token
          setStreamingText(accumulated)
        },
        onDone: (fullText) => {
          accumulated = fullText || accumulated
        },
        onError: (err) => { throw err },
        signal: ctrl.signal,
      })

      const assistantMsg: RichChatMsg = {
        role: 'assistant',
        content: accumulated || '(réponse vide)',
        timestamp: Date.now(),
      }
      const final = [...withUser, assistantMsg]
      setMessages(final)
      save(id, final)

      const preview = accumulated.replace(/[#`*_\-]/g, '').trim().split('\n')[0].slice(0, 36)
      updateAgentState(agentKey, {
        state: 'sleeping',
        task: preview ? `A produit : "${preview}..."` : 'Tâche complétée !',
        taskFile: undefined,
      })
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        if (accumulated) {
          const assistantMsg: RichChatMsg = { role: 'assistant', content: accumulated + ' …[arrêté]', timestamp: Date.now() }
          const final = [...withUser, assistantMsg]
          setMessages(final)
          save(id, final)
        }
        updateAgentState(agentKey, {
          state: 'sleeping',
          task: "Tâche interrompue par l'utilisateur",
          taskFile: undefined,
        })
      } else {
        const msg = e instanceof Error ? e.message : 'Erreur'
        setError(msg === 'NO_KEY' ? 'no-key' : msg)
        setMessages(messages)
        updateAgentState(agentKey, {
          state: 'blocked',
          task: 'Échec de la tâche',
          taskFile: undefined,
        })
      }
    } finally {
      setStreaming(false)
      setStreamingText('')
      abortRef.current = null
    }
  }

  // ---------------------------------------------------------------------------
  // Keyboard handler
  // ---------------------------------------------------------------------------

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // ---------------------------------------------------------------------------
  // CSS variables for provider color
  // ---------------------------------------------------------------------------

  const cssVars = {
    '--roost-accent': providerColor.bg,
    '--roost-glow': providerColor.glow,
  } as React.CSSProperties

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480, background: '#13151E', ...cssVars }}>

      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        flexWrap: 'wrap',
      }}>
        {/* Model selector */}
        <ModelSelector selectedModel={selectedModel} onChange={setSelectedModel} keys={settings.keys} />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Web search toggle */}
        <button
          onClick={() => setWebSearchEnabled((v) => !v)}
          title="Recherche web DuckDuckGo"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 9px', borderRadius: 7, border: '1px solid',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
            ...(webSearchEnabled
              ? { background: 'rgba(13,148,136,0.2)', borderColor: '#0D9488', color: '#0D9488' }
              : { background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: '#888' }
            ),
          }}
        >
          {searching ? (
            <>
              <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid #0D9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Cherche…
            </>
          ) : (
            <>🔍 Web</>
          )}
        </button>

        {/* Export button */}
        {messages.length > 0 && (
          <button
            onClick={exportConversation}
            title="Exporter la conversation"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#888', cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
        )}
      </div>

      {/* No key warning */}
      {!anyKey && (
        <a href="#/onboarding" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          margin: 12, padding: '10px 13px', borderRadius: 11,
          textDecoration: 'none',
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
          color: '#F97316', fontSize: 12.5, fontWeight: 600,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 19 4M16 7l3 3" />
          </svg>
          Ajoute ta clé API pour discuter →
        </a>
      )}

      {anyKey && !hasKeyForModel && (
        <div style={{
          margin: 12, padding: '10px 13px', borderRadius: 11,
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
          color: '#F97316', fontSize: 12, fontWeight: 500,
        }}>
          Pas de clé pour {providerColor.label}. Choisis un autre modèle ou <a href="#/onboarding" style={{ color: '#F97316', fontWeight: 700 }}>ajoute ta clé</a>.
        </div>
      )}

      {/* Messages area */}
      <div
        className="roost-chat-bg"
        style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && !streaming && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#555', fontSize: 13, maxWidth: 280 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
            <div>Démarre la conversation avec <strong style={{ color: '#999' }}>{agent.name}</strong></div>
            <div style={{ marginTop: 4, fontSize: 11.5, color: '#444' }}>
              {currentModelDef ? currentModelDef.label : selectedModel} · streaming · Entrée pour envoyer
            </div>
          </div>
        )}

        {/* Rendered messages */}
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} isUser={m.role === 'user'} />
        ))}

        {/* Streaming bubble */}
        {streaming && <StreamingBubble text={streamingText} agentName={agent.name} />}

        {/* Errors */}
        {error && error !== 'no-key' && (
          <div style={{
            alignSelf: 'center', fontSize: 12,
            color: '#F87171', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10,
            padding: '8px 13px', maxWidth: '90%',
          }}>
            ⚠ {error}
          </div>
        )}
        {error === 'no-key' && (
          <div style={{ alignSelf: 'center', fontSize: 12, color: '#F97316' }}>
            Ajoute ta clé dans <a href="#/onboarding" style={{ color: '#0D9488', fontWeight: 600 }}>l'onboarding</a>.
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Pending images preview */}
      {pendingImages.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, padding: '8px 16px',
          background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}>
          {pendingImages.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={img.dataUrl} alt={img.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
              <button
                onClick={() => setPendingImages((prev) => prev.filter((_, ii) => ii !== i))}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#1A1D27', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.4)',
        padding: '10px 14px 12px',
      }}>
        <div
          className="roost-input-focus"
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            background: '#1A1D27',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '8px 10px 8px 14px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Image attach (only for vision models) */}
          {supportsVision && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Joindre une image"
                disabled={streaming}
                style={{
                  flex: 'none', width: 30, height: 30, border: 'none',
                  background: 'transparent', color: streaming ? '#444' : '#666',
                  cursor: streaming ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, transition: 'color 0.15s',
                  alignSelf: 'flex-end', marginBottom: 2,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </>
          )}

          {/* Textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={`Écris à ${agent.name}…`}
            rows={1}
            disabled={streaming}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 13,
              color: '#E0E0F0', fontFamily: 'var(--font-body)',
              resize: 'none', lineHeight: 1.55,
              maxHeight: 140, padding: '4px 0',
            }}
          />

          {/* Voice input */}
          {hasSpeech && (
            <button
              onClick={listening ? stopListening : startListening}
              title={listening ? "Arrêter l'écoute" : 'Dicter un message'}
              style={{
                flex: 'none', width: 30, height: 30, border: 'none',
                background: listening ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: listening ? '#EF4444' : '#666',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, transition: 'all 0.15s',
                alignSelf: 'flex-end', marginBottom: 2,
                animation: listening ? 'roost-pulse-mic 1.5s infinite' : 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>
          )}

          {/* Stop / Send */}
          {streaming ? (
            <button
              onClick={stop}
              title="Arrêter la génération"
              style={{
                flex: 'none', width: 34, height: 34,
                border: `1.5px solid ${providerColor.bg}`,
                background: 'transparent', color: providerColor.bg,
                borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                alignSelf: 'flex-end',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim() && pendingImages.length === 0}
              aria-label="Envoyer"
              style={{
                flex: 'none', width: 34, height: 34, border: 'none',
                background: (!input.trim() && pendingImages.length === 0) ? 'rgba(255,255,255,0.06)' : providerColor.bg,
                color: '#fff', borderRadius: 10,
                cursor: (!input.trim() && pendingImages.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (!input.trim() && pendingImages.length === 0) ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: (!input.trim() && pendingImages.length === 0) ? 'none' : `0 3px 12px ${providerColor.glow}`,
                transition: 'all 0.15s',
                alignSelf: 'flex-end',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Footer meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 7, paddingLeft: 2, paddingRight: 2,
        }}>
          <div style={{ fontSize: 10.5, color: '#444' }}>
            {listening
              ? <span style={{ color: '#EF4444' }}>● Écoute…</span>
              : `${agent.name} · ${currentModelDef?.label ?? selectedModel} · Entrée pour envoyer`
            }
          </div>
          <div style={{ fontSize: 10.5, color: '#444' }}>
            ~{tokenCount.toLocaleString('fr-FR')} tokens
          </div>
        </div>
      </div>
    </div>
  )
}
