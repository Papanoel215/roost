import { useState, type CSSProperties, type ReactNode } from 'react'
import AppShell from './AppShell'
import { useSettings, setProfile, setKey, setTested, setNotif, setMfa } from '../lib/store'
import { testKey } from '../lib/llm'

const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--rest)' }
const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }
const input: CSSProperties = { width: '100%', border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 10, padding: '9px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none' }

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} role="switch" aria-checked={on} style={{ width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? 'var(--ter)' : '#D9D1C5', position: 'relative', flex: 'none', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
    </button>
  )
}

function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 className="display" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{children}</h2>
      {sub && <p style={{ margin: '4px 0 0', color: 'var(--text3)', fontSize: 13 }}>{sub}</p>}
    </div>
  )
}

function Row({ icon, name, desc, status, action }: { icon: ReactNode; name: string; desc: string; status?: { label: string; color: string }; action: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 36, height: 36, flex: 'none', borderRadius: 10, background: '#F4ECE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{desc}</div>
      </div>
      {status && <span style={{ fontSize: 11, fontWeight: 700, color: status.color, marginRight: 4 }}>● {status.label}</span>}
      {action}
    </div>
  )
}

function QuotaBar({ label: l, used, total, unit }: { label: string; used: number; total: number; unit?: string }) {
  const pct = Math.min(100, (used / total) * 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{l}</span>
        <span className="mono" style={{ color: 'var(--text3)' }}>{used} / {total} {unit}</span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: '#F1EBE2', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: pct > 85 ? 'linear-gradient(90deg,#F2A93C,#E5564B)' : 'linear-gradient(90deg,#F2A93C,#E07856)' }} />
      </div>
    </div>
  )
}

/* ---------- clé API fonctionnelle ---------- */
function KeyRow({ provider, name, prefix }: { provider: 'anthropic' | 'gemini'; name: string; prefix: string }) {
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
  const statusColor = busy ? 'var(--text3)' : ok ? 'var(--healthy)' : result ? 'var(--blocked)' : 'var(--text3)'
  const statusText = busy
    ? 'Test en cours…'
    : result && result.ok
      ? '● Clé valide & enregistrée'
      : result && !result.ok
        ? `● ${result.error}`
        : tested
          ? '● Clé enregistrée & validée'
          : value
            ? 'Clé enregistrée — clique « Tester » pour valider'
            : 'BYOK — chiffrée localement, jamais utilisée pour entraîner des modèles'

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 9, background: '#F4ECE2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{name[0]}</span>
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</span>
        {ok && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--healthy)' }}>● Connectée</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setKey(provider, e.target.value)}
          placeholder={`${prefix}…`}
          autoComplete="off"
          spellCheck={false}
          style={{ ...input, flex: 1, fontFamily: 'var(--font-mono)' }}
        />
        <button onClick={() => setShow((v) => !v)} aria-label="Afficher/masquer" style={{ width: 36, height: 36, flex: 'none', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 9, cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
        <button onClick={run} disabled={busy || !value.trim()} className="btn" style={{ padding: '9px 14px', border: '1px solid var(--ter)', background: 'rgba(224,120,86,.08)', color: 'var(--ter)', opacity: busy || !value.trim() ? 0.5 : 1, cursor: busy || !value.trim() ? 'not-allowed' : 'pointer' }}>
          {busy ? 'Test…' : 'Tester la clé'}
        </button>
      </div>
      <div style={{ marginTop: 7, fontSize: 12, color: statusColor }}>{statusText}</div>
    </div>
  )
}

const SECTIONS = ['Profil', 'Clés API', 'Workspaces', 'Notifications', 'Facturation', 'Comptes liés', 'Sécurité', 'Zone de danger'] as const
type Section = (typeof SECTIONS)[number]

export default function Settings() {
  const s = useSettings()
  const [section, setSection] = useState<Section>('Profil')

  return (
    <AppShell active="/parametres" title="Paramètres" subtitle="Profil, clés, facturation & sécurité" contentStyle={{ display: 'flex', minHeight: 0 }}>
      <nav style={{ width: 232, flex: 'none', borderRight: '1px solid var(--border)', padding: 14, overflowY: 'auto' }}>
        {SECTIONS.map((sec) => {
          const on = sec === section
          const danger = sec === 'Zone de danger'
          return (
            <button key={sec} onClick={() => setSection(sec)} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: on ? 600 : 500, marginBottom: 2, background: on ? (danger ? 'rgba(229,86,75,.10)' : 'rgba(224,120,86,.12)') : 'transparent', color: danger ? 'var(--blocked)' : on ? 'var(--ter)' : 'var(--text2)' }}>
              {sec}
            </button>
          )
        })}
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', maxWidth: 760 }}>
        {section === 'Profil' && (
          <div style={card}>
            <SectionTitle sub="Modifié en direct — enregistré automatiquement.">Profil</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%,#8FD9CC,#2FB3A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 26, boxShadow: 'var(--rest)' }}>{(s.profile.name[0] || 'M').toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>L'avatar reprend l'initiale de ton nom.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div><label style={label}>Nom</label><input value={s.profile.name} onChange={(e) => setProfile({ name: e.target.value })} style={input} /></div>
              <div><label style={label}>Handle</label><input value={s.profile.handle} onChange={(e) => setProfile({ handle: e.target.value })} style={{ ...input, fontFamily: 'var(--font-mono)' }} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={label}>Fuseau horaire</label>
              <select value={s.profile.timezone} onChange={(e) => setProfile({ timezone: e.target.value })} style={input}><option>Europe/Paris</option><option>Europe/London</option><option>America/New_York</option><option>America/Los_Angeles</option><option>Asia/Tokyo</option></select>
            </div>
            <div><label style={label}>Bio</label><textarea rows={2} value={s.profile.bio} onChange={(e) => setProfile({ bio: e.target.value })} style={{ ...input, resize: 'vertical' }} /></div>
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--healthy)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
              Enregistré — visible dans la barre latérale.
            </div>
          </div>
        )}

        {section === 'Clés API' && (
          <div style={card}>
            <SectionTitle sub="Apporte tes clés (BYOK). « Tester » vérifie la clé contre l'API du fournisseur, en direct.">Clés API</SectionTitle>
            <KeyRow provider="anthropic" name="Anthropic" prefix="sk-ant-" />
            <KeyRow provider="gemini" name="Gemini" prefix="AIza" />
            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
              Les clés sont stockées localement (navigateur) pour ce prototype. Une fois validée, ta clé Anthropic alimente le <strong style={{ color: 'var(--text2)' }}>chat en direct</strong> de la Fiche Agent (onglet Chat).
            </p>
          </div>
        )}

        {section === 'Workspaces' && (
          <div style={card}>
            <SectionTitle sub="Les dépôts sur lesquels tes agents travaillent.">Workspaces</SectionTitle>
            <Row icon={<span className="mono" style={{ fontSize: 11 }}>{'</>'}</span>} name="roost/web" desc="Branche par défaut : main" status={{ label: 'Actif', color: 'var(--healthy)' }} action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Déconnecter</button>} />
            <Row icon={<span className="mono" style={{ fontSize: 11 }}>{'</>'}</span>} name="roost/orchestrator" desc="Branche par défaut : main" status={{ label: 'Actif', color: 'var(--healthy)' }} action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Déconnecter</button>} />
            <a href="#/import" className="btn" style={{ marginTop: 16, padding: '8px 14px', border: '1px solid var(--ter)', background: 'rgba(224,120,86,.08)', color: 'var(--ter)', textDecoration: 'none', display: 'inline-flex' }}>+ Importer un projet</a>
          </div>
        )}

        {section === 'Notifications' && (
          <div style={card}>
            <SectionTitle sub="Comment Roost te prévient quand un agent a besoin de toi.">Notifications</SectionTitle>
            {([
              { k: 'push', name: 'Notifications push (PWA)', desc: 'Permissions et blocages, en temps réel.' },
              { k: 'perms', name: 'Alertes de permission', desc: 'Quand un agent demande une action sensible.' },
              { k: 'email', name: 'Résumé par email', desc: 'Un récap quotidien des runs.' },
              { k: 'weekly', name: 'Rapport hebdo', desc: 'Missions livrées, coûts, temps gagné.' },
            ] as const).map((n) => (
              <div key={n.k} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{n.desc}</div></div>
                <Toggle on={s.notif[n.k]} set={(v) => setNotif({ [n.k]: v })} />
              </div>
            ))}
          </div>
        )}

        {section === 'Facturation' && (
          <>
            <div style={{ ...card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(120deg,#FFF6F0,#F6FBFA)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Palier actuel</div>
                <div className="display" style={{ fontSize: 24, fontWeight: 800 }}>Pro <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>— 24 €/mois</span></div>
              </div>
              <button className="btn" style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>Downgrade</button>
              <button className="btn btn-primary" style={{ padding: '9px 16px' }}>Passer à Team</button>
            </div>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Usage ce mois</div>
              <QuotaBar label="Agents concurrents" used={4} total={5} />
              <QuotaBar label="Runs / mois" used={612} total={1000} />
              <QuotaBar label="Sandbox-minutes" used={1840} total={2000} unit="min" />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Factures</div>
              {[['Juin 2026', '24,00 €'], ['Mai 2026', '24,00 €'], ['Avril 2026', '24,00 €']].map(([m, a]) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ flex: 1 }}>{m}</span>
                  <span className="mono" style={{ color: 'var(--text2)', marginRight: 16 }}>{a}</span>
                  <span style={{ color: 'var(--ter)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Télécharger</span>
                </div>
              ))}
            </div>
          </>
        )}

        {section === 'Comptes liés' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Méthodes de connexion</div>
              <Row icon="G" name="Google" desc="maxime@gmail.com" status={{ label: 'Connecté', color: 'var(--healthy)' }} action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Déconnecter</button>} />
              <Row icon={<span className="mono">gh</span>} name="GitHub" desc={s.profile.handle} status={{ label: 'Connecté', color: 'var(--healthy)' }} action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Déconnecter</button>} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Intégrations</div>
              <Row icon={<span className="mono">Li</span>} name="Linear" desc="Synchronise les tickets en missions" status={{ label: 'Connecté', color: 'var(--healthy)' }} action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Déconnecter</button>} />
              <Row icon={<span className="mono">Sl</span>} name="Slack" desc="Approbations dans un canal" action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--ter)', background: 'var(--ter)', color: '#fff' }}>Connecter</button>} />
            </div>
          </div>
        )}

        {section === 'Sécurité' && (
          <div style={card}>
            <SectionTitle sub="Protège ton compte et tes runs.">Sécurité</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Authentification à deux facteurs (MFA)</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.mfa ? 'Activée — un code en plus du mot de passe.' : 'Un code en plus du mot de passe.'}</div></div>
              <Toggle on={s.mfa} set={setMfa} />
            </div>
            <Row icon="🖥️" name="Sessions actives" desc="2 appareils · Paris, Lyon" action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Tout déconnecter</button>} />
            <Row icon="🔑" name="Mot de passe" desc="Modifié il y a 3 mois" action={<button className="btn" style={{ padding: '6px 13px', fontSize: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Changer</button>} />
          </div>
        )}

        {section === 'Zone de danger' && (
          <div style={{ ...card, border: '1px solid #F2C9C4' }}>
            <SectionTitle sub="Actions irréversibles. Procède avec prudence.">Zone de danger</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Exporter mes données</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Tout ton compte au format JSON (RGPD).</div></div>
              <button className="btn" style={{ padding: '7px 14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Exporter</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0' }}>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--blocked)' }}>Supprimer mon compte</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Efface définitivement agents, runs et données.</div></div>
              <button className="btn" style={{ padding: '7px 14px', border: 'none', background: 'var(--blocked)', color: '#fff' }}>Supprimer</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
