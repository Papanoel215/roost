import { useState, type CSSProperties } from 'react'
import { BrandMark } from './Plumbob'
import { go } from '../ui/UiContext'
import { useSettings, setKey, setTested } from '../lib/store'
import { testKey } from '../lib/llm'

const field: CSSProperties = { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-mono)' }

function KeyField({ provider, displayName, prefix }: { provider: 'anthropic' | 'gemini'; displayName: string; prefix: string }) {
  const s = useSettings()
  const value = s.keys[provider]
  const tested = s.tested[provider]
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)

  const run = async () => {
    setBusy(true); setResult(null)
    const r = await testKey(provider, value)
    setTested(provider, r.ok)
    setResult(r)
    setBusy(false)
  }

  const ok = result ? result.ok : tested
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FBF6EF', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 6px 4px 12px' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => setKey(provider, e.target.value)} placeholder={`${prefix}…`} autoComplete="off" spellCheck={false} style={field} />
        <button onClick={() => setShow((v) => !v)} aria-label="Afficher/masquer" style={{ width: 30, height: 30, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
        <button onClick={run} disabled={busy || !value.trim()} className="btn" style={{ padding: '7px 12px', border: '1px solid var(--ter)', background: 'rgba(224,120,86,.08)', color: 'var(--ter)', opacity: busy || !value.trim() ? 0.5 : 1, cursor: busy || !value.trim() ? 'not-allowed' : 'pointer' }}>{busy ? 'Test…' : 'Tester la clé'}</button>
      </div>
      <div style={{ minHeight: 18, marginTop: 7, fontSize: 12, color: busy ? 'var(--text3)' : ok ? 'var(--healthy)' : result ? 'var(--blocked)' : 'var(--text3)' }}>
        {busy ? 'Validation en cours…' : ok ? `● Clé ${displayName} valide — connectée.` : result && !result.ok ? `● ${result.error}` : 'Ta clé reste chiffrée localement ; jamais utilisée pour entraîner des modèles.'}
      </div>
    </div>
  )
}

const STEPS = ['Clé Anthropic', 'Clé Gemini', 'Workspace']

export default function Onboarding() {
  const s = useSettings()
  const [step, setStep] = useState(0)
  const [connected, setConnected] = useState(false)

  const canNext = step === 0 ? s.tested.anthropic : step === 1 ? (s.tested.gemini || !s.keys.gemini) : connected
  const next = () => (step < 2 ? setStep(step + 1) : go('/'))

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(120% 80% at 50% -10%, #FFF3EC, var(--bg) 60%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BrandMark size={30} />
        <span className="display" style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.5px' }}>Roost</span>
      </div>

      <div style={{ width: 480, maxWidth: '94vw', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--rest)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6, padding: '16px 20px 0' }}>
          {STEPS.map((st, i) => <div key={st} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= step ? 'var(--ter)' : '#F1EBE2' }} />)}
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 4 }}>Étape {step + 1} / 3 · {STEPS[step]}</div>

          {step === 0 && (
            <>
              <h1 className="display" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Apporte ta clé Anthropic</h1>
              <p style={{ margin: '0 0 18px', color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>BYOK — tes clés, tes données. Une fois validée, elle alimente le chat en direct des agents Claude.</p>
              <KeyField provider="anthropic" displayName="Anthropic" prefix="sk-ant-" />
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="display" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Et ta clé Gemini <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)' }}>(optionnel)</span></h1>
              <p style={{ margin: '0 0 18px', color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>Pour router chaque tâche vers le bon modèle — Claude ou Gemini, côte à côte.</p>
              <KeyField provider="gemini" displayName="Gemini" prefix="AIza" />
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="display" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Connecte un workspace</h1>
              <p style={{ margin: '0 0 18px', color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>Le dépôt sur lequel ton équipe d'agents va travailler.</p>
              <button onClick={() => setConnected(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', background: connected ? 'rgba(61,190,122,.08)' : 'var(--surface)', border: `1px solid ${connected ? 'var(--healthy)' : 'var(--border)'}` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8a4.8 4.8 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12 12 0 0 0-6.4 0C7.6 1 6.5 1.3 6.5 1.3A4.8 4.8 0 0 0 6.4 4.8 5.2 5.2 0 0 0 5 8.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" /></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{connected ? 'roost/web — connecté ✓' : 'Se connecter avec GitHub'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{connected ? 'Branche par défaut : main' : "Autorise l'accès au dépôt"}</div>
                </div>
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)', background: '#FCFAF6' }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="btn" style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Précédent</button>
          ) : (
            <a href="#/" className="btn" style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', textDecoration: 'none' }}>Plus tard</a>
          )}
          <button onClick={next} disabled={!canNext} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '9px 20px', opacity: canNext ? 1 : 0.5, cursor: canNext ? 'pointer' : 'not-allowed' }}>
            {step < 2 ? 'Continuer' : 'Entrer dans le studio'}
          </button>
        </div>
      </div>
    </div>
  )
}
