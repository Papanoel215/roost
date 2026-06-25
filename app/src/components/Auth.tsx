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

  // Social Auth popup simulation states
  const [activeProvider, setActiveProvider] = useState<'google' | 'facebook' | 'apple' | null>(null)
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialStep, setSocialStep] = useState<'select' | 'custom'>('select')
  const [socialEmail, setSocialEmail] = useState('')
  const [socialName, setSocialName] = useState('')
  const [socialError, setSocialError] = useState<string | null>(null)

  // Apple specific states
  const [appleEmailOption, setAppleEmailOption] = useState<'share' | 'hide'>('share')
  const [applePassword, setApplePassword] = useState('')

  const submit = () => {
    setError(null)
    const r = mode === 'signup' ? signUpEmail(name, email, password) : signInEmail(email, password)
    if (!r.ok) setError(r.error || 'Erreur')
  }

  const openSocial = (provider: 'google' | 'facebook' | 'apple') => {
    setActiveProvider(provider)
    setSocialStep('select')
    setSocialEmail('')
    setSocialName('')
    setSocialError(null)
    setSocialLoading(false)
    setAppleEmailOption('share')
    setApplePassword('')
  }

  const closeSocial = () => {
    setActiveProvider(null)
  }

  const handleSocialLogin = (finalEmail: string, finalName: string) => {
    if (!finalEmail.trim()) {
      setSocialError('E-mail requis')
      return
    }
    const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!EMAIL_RE.test(finalEmail.trim())) {
      setSocialError('Adresse e-mail invalide')
      return
    }

    setSocialError(null)
    setSocialLoading(true)

    // Simule la latence d'authentification OAuth (1,2s)
    setTimeout(() => {
      setSocialLoading(false)
      signInProvider(activeProvider!, finalEmail.trim(), finalName.trim() || finalEmail.split('@')[0])
      closeSocial()
    }, 1200)
  }

  const handleAppleLogin = () => {
    if (!socialEmail.trim()) {
      setSocialError('Identifiant Apple (e-mail) requis')
      return
    }
    const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!EMAIL_RE.test(socialEmail.trim())) {
      setSocialError('Adresse e-mail invalide')
      return
    }
    if (!socialName.trim()) {
      setSocialError('Nom requis')
      return
    }
    if (applePassword.length < 4) {
      setSocialError('Mot de passe Apple ID invalide')
      return
    }

    let finalEmail = socialEmail.trim().toLowerCase()
    if (appleEmailOption === 'hide') {
      const randStr = Math.random().toString(36).substring(2, 10)
      finalEmail = `${randStr}@privaterelay.appleid.com`
    }

    handleSocialLogin(finalEmail, socialName)
  }

  const renderSocialFlow = () => {
    if (!activeProvider) return null

    const inputStyle: CSSProperties = {
      ...input,
      background: activeProvider === 'apple' ? '#1c1c1e' : '#FBF6EF',
      color: activeProvider === 'apple' ? '#fff' : 'var(--text)',
      border: activeProvider === 'apple' ? '1px solid #3a3a3c' : '1px solid var(--border)',
    }

    const labelStyle: CSSProperties = {
      ...label,
      color: activeProvider === 'apple' ? '#a1a1a6' : 'var(--text2)',
    }

    if (activeProvider === 'google') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
            </svg>
          </div>

          {socialStep === 'select' ? (
            <div style={{ width: '100%' }}>
              <h3 className="display" style={{ margin: '0 0 4px', textAlign: 'center', fontSize: 20, fontWeight: 800 }}>Se connecter avec Google</h3>
              <p style={{ margin: '0 0 20px', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>pour continuer vers Roost</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {/* Maxime account choice */}
                <button
                  onClick={() => handleSocialLogin('maxime@gmail.com', 'Maxime')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 10,
                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'radial-gradient(circle at 32% 28%, #8FD9CC, #2FB3A3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                  }}>M</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Maxime</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>maxime@gmail.com</div>
                  </div>
                </button>

                {/* Anthony account choice */}
                <button
                  onClick={() => handleSocialLogin('anthony@gmail.com', 'Anthony')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 10,
                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'radial-gradient(circle at 32% 28%, #F2A07A, #C85F3F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                  }}>A</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Anthony</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>anthony@gmail.com</div>
                  </div>
                </button>

                {/* Custom account choice */}
                <button
                  onClick={() => setSocialStep('custom')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    border: '1.5px dashed var(--border)', background: 'transparent', borderRadius: 10,
                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid var(--border)', background: '#F4ECE2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text2)', fontWeight: 600, fontSize: 18,
                  }}>+</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text2)' }}>Utiliser un autre compte</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Saisissez votre e-mail Google</div>
                  </div>
                </button>
              </div>

              <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                Pour continuer, Google partagera votre nom, votre adresse e-mail et votre photo de profil avec Roost.
              </p>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <h3 className="display" style={{ margin: '0 0 16px', textAlign: 'center', fontSize: 18, fontWeight: 800 }}>Nouveau compte Google</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Adresse e-mail Google</label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder="nom@gmail.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Votre Nom"
                    style={inputStyle}
                  />
                </div>
              </div>

              {socialError && <div style={{ fontSize: 12, color: 'var(--blocked)', marginBottom: 12 }}>⚠ {socialError}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSocialStep('select')} className="btn" style={{ flex: 1, padding: 10, border: '1px solid var(--border)', background: 'transparent' }}>
                  Retour
                </button>
                <button
                  onClick={() => handleSocialLogin(socialEmail, socialName)}
                  className="btn btn-primary" style={{ flex: 1, padding: 10, justifyContent: 'center' }}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeProvider === 'facebook') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
            </svg>
          </div>

          {socialStep === 'select' ? (
            <div style={{ width: '100%' }}>
              <h3 className="display" style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#1877F2' }}>Connexion Facebook</h3>
              <p style={{ margin: '0 0 22px', textAlign: 'center', fontSize: 13, color: 'var(--text2)', lineHeight: 1.45 }}>
                Roost demande à accéder à votre nom complet et à votre adresse e-mail.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <button
                  onClick={() => handleSocialLogin('maxime@facebook.com', 'Maxime')}
                  style={{
                    width: '100%', background: '#1877F2', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '12px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(24,119,242,0.2)',
                  }}
                >
                  Continuer en tant que Maxime
                </button>
                <button
                  onClick={() => handleSocialLogin('anthony@facebook.com', 'Anthony')}
                  style={{
                    width: '100%', background: '#1877F2', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '12px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(24,119,242,0.2)',
                  }}
                >
                  Continuer en tant que Anthony
                </button>
                <button
                  onClick={() => setSocialStep('custom')}
                  style={{
                    width: '100%', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Se connecter avec un autre compte
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => closeSocial()} style={{ border: 'none', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12 }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <h3 className="display" style={{ margin: '0 0 16px', textAlign: 'center', fontSize: 18, fontWeight: 800 }}>Nouveau compte Facebook</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Adresse e-mail Facebook</label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder="nom@facebook.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Votre Nom"
                    style={inputStyle}
                  />
                </div>
              </div>

              {socialError && <div style={{ fontSize: 12, color: 'var(--blocked)', marginBottom: 12 }}>⚠ {socialError}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSocialStep('select')} className="btn" style={{ flex: 1, padding: 10, border: '1px solid var(--border)', background: 'transparent' }}>
                  Retour
                </button>
                <button
                  onClick={() => handleSocialLogin(socialEmail, socialName)}
                  className="btn btn-primary" style={{ flex: 1, padding: 10, justifyContent: 'center' }}
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeProvider === 'apple') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', color: '#fff' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.46 7.81 1.3 10.37.86 1.25 1.88 2.66 3.22 2.61 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.28 3.12-2.54.98-1.46 1.39-2.87 1.41-2.94-.03-.01-2.7-1.04-2.73-4.12ZM14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44Z" />
            </svg>
          </div>

          <h3 className="display" style={{ margin: '0 0 6px', textAlign: 'center', fontSize: 18, fontWeight: 800 }}>Connexion Apple ID</h3>
          <p style={{ margin: '0 0 18px', textAlign: 'center', fontSize: 12.5, color: '#a1a1a6', lineHeight: 1.4 }}>
            Utilisez votre identifiant Apple pour configurer et synchroniser Roost.
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Identifiant Apple (Adresse e-mail)</label>
              <input
                type="email"
                value={socialEmail}
                onChange={(e) => setSocialEmail(e.target.value)}
                placeholder="exemple@icloud.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input
                type="text"
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                placeholder="Maxime"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe Apple ID</label>
              <input
                type="password"
                value={applePassword}
                onChange={(e) => setApplePassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 4, background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: 10, padding: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 8 }}>E-MAIL APPLE ID</span>
              
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
                <input
                  type="radio"
                  name="appleEmail"
                  checked={appleEmailOption === 'share'}
                  onChange={() => setAppleEmailOption('share')}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', display: 'block' }}>Partager mon e-mail</span>
                  <span style={{ fontSize: 11, color: '#a1a1a6' }}>Transmettre votre adresse e-mail Apple ID réelle.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="appleEmail"
                  checked={appleEmailOption === 'hide'}
                  onChange={() => setAppleEmailOption('hide')}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', display: 'block' }}>Masquer mon e-mail</span>
                  <span style={{ fontSize: 11, color: '#a1a1a6' }}>Générer une adresse relais e-mail masquée.</span>
                </div>
              </label>
            </div>
          </div>

          {socialError && <div style={{ fontSize: 12, color: '#ff453a', marginBottom: 12, alignSelf: 'flex-start' }}>⚠ {socialError}</div>}

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={() => closeSocial()}
              style={{
                flex: 1, padding: 11, borderRadius: 10, border: '1px solid #3a3a3c',
                background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleAppleLogin}
              style={{
                flex: 1, padding: 11, borderRadius: 10, border: 'none',
                background: '#fff', color: '#000', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleup {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

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
            <SocialButton icon={<GoogleIcon />} label="Continuer avec Google" onClick={() => openSocial('google')} />
            <SocialButton icon={<FacebookIcon />} label="Continuer avec Facebook" onClick={() => openSocial('facebook')} />
            <SocialButton icon={<AppleIcon />} label="Continuer avec Apple" onClick={() => openSocial('apple')} />
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

      {/* MODALE DIALOG SIMULÉE DE CONNEXION SOCIALE */}
      {activeProvider && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(26, 17, 10, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadein 0.2s ease',
        }}>
          <div
            className={activeProvider === 'apple' ? 'auth-apple-modal' : ''}
            style={{
              width: 420, maxWidth: '90%',
              background: activeProvider === 'apple' ? '#000' : 'var(--surface)',
              border: activeProvider === 'apple' ? '1px solid #2c2c2e' : '1px solid var(--border)',
              borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              animation: 'scaleup 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Barre de titre type fenêtre */}
            <div style={{
              padding: '12px 16px',
              background: activeProvider === 'apple' ? '#1c1c1e' : '#F4ECE2',
              borderBottom: activeProvider === 'apple' ? '1px solid #2c2c2e' : '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5564B', cursor: 'pointer' }} onClick={() => closeSocial()} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F2B23C' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2FB3A3' }} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: activeProvider === 'apple' ? '#a1a1a6' : 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {activeProvider === 'google' ? 'Google Accounts' : activeProvider === 'apple' ? 'Apple ID' : 'Facebook Login'}
              </span>
              <div style={{ width: 30 }} />
            </div>

            {/* Contenu */}
            <div style={{ padding: '24px 28px' }}>
              {socialLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 14 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: activeProvider === 'apple' ? '3px solid #2c2c2e' : '3px solid var(--border)',
                    borderTopColor: activeProvider === 'apple' ? '#fff' : 'var(--ter)',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: activeProvider === 'apple' ? '#e5e5ea' : 'var(--text2)' }}>
                    Connexion sécurisée en cours...
                  </span>
                </div>
              ) : (
                renderSocialFlow()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
