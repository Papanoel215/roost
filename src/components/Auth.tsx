import { useState, type CSSProperties } from 'react'
import { BrandMark } from './Plumbob'
import { signUpEmail, signInEmail, signInProvider } from '../lib/auth'

const input: CSSProperties = { width: '100%', border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 11, padding: '11px 13px', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none' }
const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
function FacebookIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" /></svg>
}
function AppleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#000" aria-hidden="true"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.46 7.81 1.3 10.37.86 1.25 1.88 2.66 3.22 2.61 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.28 3.12-2.54.98-1.46 1.39-2.87 1.41-2.94-.03-.01-2.7-1.04-2.73-4.12ZM14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44Z" /></svg>
}

function SocialButton({ icon, label: l, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 14px', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)', boxShadow: 'var(--rest)' }}>
      {icon}{l}
    </button>
  )
}

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    const r = mode === 'signup' ? signUpEmail(name, email, password) : signInEmail(email, password)
    if (!r.ok) setError(r.error || 'Erreur')
    // succès → la session est posée → App bascule sur l'app
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* panneau de marque (gauche, desktop) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'radial-gradient(120% 90% at 25% 15%,#FCF3E4 0%,#F0DEC4 50%,#E4CDA8 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }} className="auth-hero">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px),repeating-linear-gradient(-30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px)' }} />
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <BrandMark size={44} animated />
            <span className="display" style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1px' }}>Roost</span>
          </div>
          <h1 className="display" style={{ margin: '0 0 14px', fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>Pilotez toute votre équipe d'agents IA, sous un même toit.</h1>
          <p style={{ margin: 0, color: 'var(--text2)', fontSize: 16, lineHeight: 1.5 }}>Claude <em>et</em> Gemini, côte à côte. Vous voyez ce que chaque agent fait, vous approuvez d'un geste, et vous gardez la main sur la facture.</p>
          <div style={{ display: 'flex', gap: 18, marginTop: 28, color: 'var(--text2)', fontSize: 13, fontWeight: 600 }}>
            <span>● Multi-moteur</span><span>● BYOK</span><span>● Gouvernance d'équipe</span>
          </div>
        </div>
      </div>

      {/* formulaire (droite) */}
      <div style={{ width: 480, maxWidth: '100%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }} className="auth-form">
        <div style={{ width: 360, maxWidth: '100%' }}>
          <div style={{ alignItems: 'center', gap: 9, marginBottom: 22 }} className="auth-form-brand">
            <BrandMark size={26} />
            <span className="display" style={{ fontWeight: 800, fontSize: 20 }}>Roost</span>
          </div>

          <h2 className="display" style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>{mode === 'signup' ? 'Crée ton studio' : 'Bon retour'}</h2>
          <p style={{ margin: '0 0 22px', color: 'var(--text3)', fontSize: 14 }}>{mode === 'signup' ? 'Quelques secondes pour démarrer.' : 'Connecte-toi pour retrouver tes agents.'}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <SocialButton icon={<GoogleIcon />} label="Continuer avec Google" onClick={() => signInProvider('google')} />
            <SocialButton icon={<FacebookIcon />} label="Continuer avec Facebook" onClick={() => signInProvider('facebook')} />
            <SocialButton icon={<AppleIcon />} label="Continuer avec Apple" onClick={() => signInProvider('apple')} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>ou avec un email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {mode === 'signup' && (
              <div><label style={label}>Nom</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" style={input} /></div>
            )}
            <div><label style={label}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="toi@exemple.com" autoComplete="email" style={input} /></div>
            <div>
              <label style={label}>Mot de passe</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...input, padding: '0 6px 0 13px' }}>
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={mode === 'signup' ? '6 caractères minimum' : '••••••••'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-body)', padding: '11px 0' }} />
                <button onClick={() => setShow((v) => !v)} aria-label="Afficher/masquer" style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--blocked)', background: 'rgba(229,86,75,.08)', border: '1px solid #F2C9C4', borderRadius: 10, padding: '9px 12px' }}>⚠ {error}</div>}

            <button onClick={submit} className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 4 }}>
              {mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            {mode === 'signup' ? 'Déjà un compte ? ' : "Pas encore de compte ? "}
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null) }} style={{ border: 'none', background: 'none', color: 'var(--ter)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>

          <p style={{ marginTop: 22, fontSize: 11, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.5 }}>
            En continuant, tu acceptes les CGU et la politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  )
}
