import { useEffect, useRef, useState } from 'react'
import { AGENTS } from '../data/agents'
import { useSettings } from '../lib/store'
import { streamChat } from '../lib/llm'
import type { ChatMsg } from '../lib/types'
import { buildSystemContext } from '../lib/context'
import { getLatestConversationForAgent, upsertConversation } from '../lib/store'

export default function ChatPanel({ agentKey }: { agentKey: string }) {
  const agent = AGENTS[agentKey]
  const settings = useSettings()
  const provider = agent.engine.kind
  const hasKey = provider === 'gemini' ? !!settings.keys.gemini : !!settings.keys.anthropic

  const [convId, setConvId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load existing conversation when agent changes
  useEffect(() => {
    const existing = getLatestConversationForAgent(agentKey)
    if (existing) {
      setConvId(existing.id)
      setMessages(existing.messages)
    } else {
      setConvId('conv_' + agentKey + '_' + Date.now())
      setMessages([])
    }
    setInput('')
    setError(null)
    setStreamingText('')
  }, [agentKey])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])

  const save = (id: string, msgs: ChatMsg[]) => {
    upsertConversation({
      id,
      agentKey,
      title: msgs.find((m) => m.role === 'user')?.content.slice(0, 60) ?? agent.name,
      messages: msgs,
      updatedAt: Date.now(),
    })
  }

  const stop = () => { abortRef.current?.abort() }

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setError(null)

    const userMsg: ChatMsg = { role: 'user', content: text }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    const ctrl = new AbortController()
    abortRef.current = ctrl
    let accumulated = ''

    const id = convId || ('conv_' + agentKey + '_' + Date.now())
    if (!convId) setConvId(id)

    try {
      await streamChat(
        provider,
        agent.engine.model,
        buildSystemContext(agentKey),
        withUser,
        (token) => {
          accumulated += token
          setStreamingText(accumulated)
        },
        ctrl.signal,
      )

      const assistantMsg: ChatMsg = { role: 'assistant', content: accumulated || '(réponse vide)' }
      const final = [...withUser, assistantMsg]
      setMessages(final)
      save(id, final)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        if (accumulated) {
          const assistantMsg: ChatMsg = { role: 'assistant', content: accumulated + ' …[arrêté]' }
          const final = [...withUser, assistantMsg]
          setMessages(final)
          save(id, final)
        }
      } else {
        const msg = e instanceof Error ? e.message : 'Erreur'
        setError(msg === 'NO_KEY' ? 'no-key' : msg)
        setMessages(messages) // revert optimistic user msg
      }
    } finally {
      setStreaming(false)
      setStreamingText('')
      abortRef.current = null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480 }}>
      {!hasKey && (
        <a href="#/onboarding" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 14, padding: '10px 13px', borderRadius: 11, textDecoration: 'none', background: '#FFF8EC', border: '1px solid #F3DFB4', color: '#A9791C', fontSize: 12.5, fontWeight: 600 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 19 4M16 7l3 3" /></svg>
          Ajoute ta clé {provider === 'gemini' ? 'Gemini' : 'Anthropic'} pour discuter en vrai →
        </a>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && !streaming && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text3)', fontSize: 13, maxWidth: 260 }}>
            Démarre la conversation avec <strong style={{ color: 'var(--text2)' }}>{agent.name}</strong> — il répond en temps réel via {agent.engine.label}.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '82%', background: 'var(--ter)', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', boxShadow: '0 3px 9px rgba(224,120,86,.25)' }}>
              {m.content}
            </div>
          ) : (
            <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--text)', whiteSpace: 'pre-wrap', boxShadow: 'var(--rest)' }}>
              {m.content}
            </div>
          )
        )}

        {/* streaming bubble — tokens arrive live */}
        {streaming && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--text)', whiteSpace: 'pre-wrap', boxShadow: 'var(--rest)', position: 'relative' }}>
            {streamingText || (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text2)' }}>
                <span style={{ fontSize: 12 }}>{agent.name} réfléchit</span>
                {[0, 0.2, 0.4].map((d) => (
                  <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text3)', animation: `dot 1.2s infinite ${d}s` }} />
                ))}
              </span>
            )}
            <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--ter)', marginLeft: 1, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
          </div>
        )}

        {error && error !== 'no-key' && (
          <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--blocked)', background: 'rgba(229,86,75,.08)', border: '1px solid #F2C9C4', borderRadius: 10, padding: '8px 12px', maxWidth: '90%' }}>⚠ {error}</div>
        )}
        {error === 'no-key' && (
          <div style={{ alignSelf: 'center', fontSize: 12, color: '#A9791C' }}>
            Ajoute d'abord ta clé dans <a href="#/onboarding" style={{ color: 'var(--ter)', fontWeight: 600 }}>l'onboarding</a>.
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', background: '#fff', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, background: '#FBF6EF', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 10px 8px 14px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Écris à ${agent.name}…`}
            rows={1}
            disabled={streaming}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)', resize: 'none', lineHeight: 1.5, maxHeight: 120, padding: '4px 0' }}
          />

          {streaming ? (
            <button onClick={stop} title="Arrêter la génération" style={{ flex: 'none', width: 34, height: 34, border: '1.5px solid var(--ter)', background: '#fff', color: 'var(--ter)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
            </button>
          ) : (
            <button onClick={send} disabled={!input.trim()} aria-label="Envoyer" style={{ flex: 'none', width: 34, height: 34, border: 'none', background: 'var(--ter)', color: '#fff', borderRadius: 10, cursor: !input.trim() ? 'not-allowed' : 'pointer', opacity: !input.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px rgba(224,120,86,.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" /></svg>
            </button>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 7, textAlign: 'center' }}>
          {agent.name} répond via {agent.engine.label} · streaming · Entrée pour envoyer
        </div>
      </div>
    </div>
  )
}
