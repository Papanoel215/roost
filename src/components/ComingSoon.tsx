import AppShell from './AppShell'

export default function ComingSoon({ route, title }: { route: string; title: string }) {
  return (
    <AppShell
      active={route}
      title={title}
      subtitle="Bientôt disponible"
      contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <svg width="96" height="104" viewBox="0 0 140 150" style={{ marginBottom: 6, opacity: 0.85 }} aria-hidden="true">
          <ellipse cx="70" cy="142" rx="36" ry="8" fill="rgba(60,40,20,.1)" />
          <defs>
            <radialGradient id="csB" cx="35%" cy="26%" r="80%"><stop offset="0" stopColor="#F0E6DA" /><stop offset="1" stopColor="#D9CBBA" /></radialGradient>
            <radialGradient id="csH" cx="38%" cy="30%" r="75%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#EFE7DC" /></radialGradient>
          </defs>
          <rect x="40" y="74" width="60" height="64" rx="28" fill="url(#csB)" />
          <circle cx="70" cy="48" r="28" fill="url(#csH)" />
          <path d="M58 50 q3 -3 7 0 M77 50 q3 -3 7 0" stroke="#A89F92" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M62 64 q8 3 16 0" fill="none" stroke="#A89F92" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <h3 className="display" style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 700 }}>« {title} » arrive bientôt</h3>
        <p style={{ margin: '0 0 18px', color: 'var(--text2)' }}>
          Cet écran fait partie de la V1 (voir la roadmap). En attendant, le studio, les missions, la revue et l'analytics sont opérationnels.
        </p>
        <a href="#/" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 18px', fontSize: 14 }}>
          Retour au studio
        </a>
      </div>
    </AppShell>
  )
}
