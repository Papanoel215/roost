import { useState } from 'react'
import { BrandMark } from './Plumbob'
import { setKey, setTested } from '../lib/store'
import { testKey } from '../lib/llm'
import { signOut } from '../lib/auth'

export default function KeyOnboarding({ onDone }: { onDone: () => void }) {
  const [anthropicKey, setAnthropicKey] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null)

  const test = async () => {
    if (!anthropicKey.trim()) return
    setBusy(true); setResult(null)
    const r = await testKey('anthropic', anthropicKey.trim())
    setTested('anthropic', r.ok)
    setResult(r)
    if (r.ok) setKey('anthropic', anthropicKey.trim())
    setBusy(false)
  }

  const finish = () => {
    if (anthropicKey.trim() && !result?.ok) setKey('anthropic', anthropicKey.trim())
    onDone()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* gauche : brand */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(120% 90% at 25% 15%,#FCF3E4 0%,#F0DEC4 50%,#E4CDA8 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px',
      }} className="auth-hero">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px),repeating-linear-gradient(-30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px)' }} />
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <BrandMark size={44} animated />
            <span className="display" style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1px' }}>Roost</span>
          </div>
          <h1 className="display" style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>Branche ta clé Anthropic pour débloquer les agents.</h1>
          <p style={{ margin: 0, color: 'var(--text2)', fontSize: 15, lineHeight: 1.6 }}>BYOK — ta clé reste dans ton navigateur. Jamais envoyée à nos serveurs, jamais utilisée pour entraîner des modèles.</p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { dot: 'var(--teal)', text: 'Chat en direct avec chaque agent' },
              { dot: 'var(--ter)', text: 'Lancer des missions réelles depuis le Kanban' },
              { dot: 'var(--healthy)', text: 'Coût par run affiché en transparence' },
            ].map(({ dot, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flex: 'none' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* droite : formulaire */}
      <div style={{ width: 480, maxWidth: '100%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }} className="auth-form">
        <div style={{ width: 380, maxWidth: '100%' }}>
          {/* étape */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--healthy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
            </span>
            <span style={{ width: 28, height: 2, borderRadius: 99, background: 'var(--ter)' }} />
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>2</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Configuration de ta clé API</span>
          </div>

          <h2 className="display" style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>Branche ta clé Anthropic</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text3)', fontSize: 14, lineHeight: 1.5 }}>
            Récupère ta clé sur <strong style={{ color: 'var(--text2)' }}>console.anthropic.com</strong> → API Keys → Create Key.
          </p>

          {/* champ clé */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Clé Anthropic</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 11, overflow: 'hidden', ...(result?.ok ? { borderColor: 'var(--healthy)' } : result ? { borderColor: 'var(--blocked)' } : {}) }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={anthropicKey}
                  onChange={(e) => { setAnthropicKey(e.target.value); setResult(null) }}
                  placeholder="sk-ant-api03-…"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '11px 13px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
                />
                <button onClick={() => setShow(v => !v)} aria-label="Afficher/masquer" style={{ width: 38, height: 38, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              <button
                onClick={test}
                disabled={busy || !anthropicKey.trim()}
                style={{
                  flex: 'none', padding: '11px 15px', border: '1px solid var(--ter)', borderRadius: 11,
                  background: 'rgba(224,120,86,.09)', color: 'var(--ter)', fontWeight: 600, fontSize: 13,
                  cursor: busy || !anthropicKey.trim() ? 'not-allowed' : 'pointer',
                  opacity: busy || !anthropicKey.trim() ? 0.5 : 1,
                }}
              >
                {busy ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid var(--ter)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    Test…
                  </span>
                ) : 'Tester'}
              </button>
            </div>
            <div style={{ marginTop: 7, fontSize: 12, minHeight: 18, color: result?.ok ? 'var(--healthy)' : result ? 'var(--blocked)' : 'var(--text3)' }}>
              {result?.ok ? '✓ Clé valide — tu es prêt à lancer tes agents !' : result ? `⚠ ${result.error}` : 'Ta clé est stockée localement, jamais envoyée à nos serveurs.'}
            </div>
          </div>

          <button
            onClick={finish}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 8, opacity: result?.ok ? 1 : 0.9 }}
          >
            {result?.ok ? 'Accéder au studio →' : anthropicKey.trim() ? 'Enregistrer et continuer →' : 'Configurer plus tard →'}
          </button>

          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
            Tu pourras modifier ta clé à tout moment dans <strong style={{ color: 'var(--text2)' }}>Paramètres → Clés API</strong>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button onClick={() => { signOut(); }} style={{ border: 'none', background: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer' }}>
              ← Retour / Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
