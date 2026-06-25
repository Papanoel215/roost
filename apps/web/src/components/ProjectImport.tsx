import { useState, type CSSProperties, type ReactNode } from 'react'
import AppShell from './AppShell'
import { go } from '../ui/UiContext'

const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--rest)' }

const STEPS = ['Source', 'Dépôt', 'Détection', 'Confirmation']

interface Repo { name: string; lang: string; seen: string }
const REPOS: Repo[] = [
  { name: 'roost/web', lang: 'TypeScript', seen: 'il y a 2 h' },
  { name: 'roost/orchestrator', lang: 'TypeScript', seen: 'hier' },
  { name: 'roost/marketing', lang: 'Astro', seen: 'il y a 3 j' },
  { name: 'dotfiles', lang: 'Shell', seen: 'il y a 1 sem' },
]

type DType = 'rule' | 'mcp' | 'skill'
interface Found { id: string; group: string; type: DType; name: string; dest: string }
const FOUND: Found[] = [
  { id: 'r1', group: 'Règles & conventions', type: 'rule', name: 'CLAUDE.md', dest: 'Contexte partagé' },
  { id: 'r2', group: 'Règles & conventions', type: 'rule', name: '.cursorrules', dest: 'Contexte partagé' },
  { id: 'r3', group: 'Règles & conventions', type: 'rule', name: 'CONTRIBUTING.md', dest: 'Contexte partagé' },
  { id: 'm1', group: 'Connecteurs MCP', type: 'mcp', name: 'GitHub', dest: 'Tous les agents' },
  { id: 'm2', group: 'Connecteurs MCP', type: 'mcp', name: 'Postgres', dest: 'Agent Backend' },
  { id: 'm3', group: 'Connecteurs MCP', type: 'mcp', name: 'Vercel', dest: 'Agent DevOps' },
  { id: 's1', group: 'Skills & agents', type: 'skill', name: '3 agents (.claude/agents)', dest: "Foyer d'agents" },
  { id: 's2', group: 'Skills & agents', type: 'skill', name: 'ESLint + Prettier', dest: 'Agent Frontend' },
]

const TYPE_ICON: Record<DType, ReactNode> = {
  rule: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5" />,
  mcp: <path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" />,
  skill: <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4L12 3Z" />,
}

export default function ProjectImport() {
  const [step, setStep] = useState(0)
  const [source, setSource] = useState<'github' | 'local' | null>(null)
  const [repo, setRepo] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set(FOUND.map((f) => f.id)))

  const toggle = (id: string) => setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const canNext = step === 0 ? !!source : step === 1 ? (source === 'local' || !!repo) : true
  const groups = [...new Set(FOUND.map((f) => f.group))]
  const counts = {
    rule: FOUND.filter((f) => f.type === 'rule' && checked.has(f.id)).length,
    mcp: FOUND.filter((f) => f.type === 'mcp' && checked.has(f.id)).length,
    skill: FOUND.filter((f) => f.type === 'skill' && checked.has(f.id)).length,
  }

  return (
    <AppShell active="/import" title="Importer un projet" subtitle="Détection auto de tes règles, MCP & agents" contentStyle={{ overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 680, maxWidth: '100%' }}>
        {/* stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i <= step ? 'var(--ter)' : '#F1EBE2', color: i <= step ? '#fff' : 'var(--text3)' }}>
                {i < step ? '✓' : i + 1}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: i <= step ? 'var(--text)' : 'var(--text3)' }}>{s}</span>
              {i < STEPS.length - 1 && <span style={{ flex: 1, height: 2, background: i < step ? 'var(--ter)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* étape 0 : source */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {([
              { k: 'github', title: 'Dépôt GitHub', desc: 'Connecte un repo — on détecte règles, MCP et agents.', icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8a4.8 4.8 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12 12 0 0 0-6.4 0C7.6 1 6.5 1.3 6.5 1.3A4.8 4.8 0 0 0 6.4 4.8 5.2 5.2 0 0 0 5 8.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" /> },
              { k: 'local', title: 'Dossier local', desc: 'Importe depuis un dossier de ton disque.', icon: <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" /> },
            ] as const).map((s) => {
              const on = source === s.k
              return (
                <button key={s.k} onClick={() => setSource(s.k)} style={{ ...card, textAlign: 'left', cursor: 'pointer', padding: 20, border: `1.5px solid ${on ? 'var(--ter)' : 'var(--border)'}`, background: on ? 'rgba(224,120,86,.05)' : 'var(--surface)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 12 }}>{s.icon}</svg>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.45 }}>{s.desc}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* étape 1 : dépôt */}
        {step === 1 && (
          source === 'github' ? (
            <div style={{ ...card, overflow: 'hidden' }}>
              {REPOS.map((r, i) => {
                const on = repo === r.name
                return (
                  <button key={r.name} onClick={() => setRepo(r.name)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', border: 'none', borderBottom: i < REPOS.length - 1 ? '1px solid var(--border)' : 'none', background: on ? 'rgba(224,120,86,.06)' : 'transparent' }}>
                    <span style={{ width: 18, height: 18, flex: 'none', borderRadius: '50%', border: `2px solid ${on ? 'var(--ter)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ter)' }} />}</span>
                    <span className="mono" style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{r.lang}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', width: 88, textAlign: 'right' }}>{r.seen}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ ...card, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Chemin du dossier</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input defaultValue="C:\\Users\\Maxime\\projets\\mon-app" style={{ flex: 1, border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text)', outline: 'none' }} />
                <button className="btn" style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>Parcourir…</button>
              </div>
            </div>
          )
        )}

        {/* étape 2 : détection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--text2)', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--healthy)' }} />
              Roost a trouvé <strong style={{ color: 'var(--text)' }}>{FOUND.length} éléments</strong> dans {repo ?? 'le dossier'} — décoche ce que tu ne veux pas importer.
            </div>
            {groups.map((g) => (
              <div key={g} style={{ ...card, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>{g}</div>
                {FOUND.filter((f) => f.group === g).map((f) => {
                  const on = checked.has(f.id)
                  return (
                    <button key={f.id} onClick={() => toggle(f.id)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', border: 'none', background: 'transparent', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: 20, height: 20, flex: 'none', borderRadius: 6, border: `1.5px solid ${on ? 'var(--ter)' : 'var(--border)'}`, background: on ? 'var(--ter)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>}
                      </span>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TYPE_ICON[f.type]}</svg>
                      <span className="mono" style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{f.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tealdeep)', background: 'rgba(47,179,163,.12)', borderRadius: 999, padding: '3px 10px' }}>→ {f.dest}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* étape 3 : confirmation */}
        {step === 3 && (
          <div style={{ ...card, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(61,190,122,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--healthy)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
            </div>
            <h2 className="display" style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Tout est prêt</h2>
            <p style={{ margin: '0 0 20px', color: 'var(--text2)' }}>Roost va importer depuis <span className="mono" style={{ color: 'var(--text)' }}>{repo ?? 'ton dossier'}</span> :</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 24 }}>
              {[['Règles', counts.rule], ['Connecteurs', counts.mcp], ['Skills & agents', counts.skill]].map(([k, v]) => (
                <div key={k as string}><div className="display" style={{ fontSize: 28, fontWeight: 800, color: 'var(--ter)' }}>{v as number}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{k as string}</div></div>
              ))}
            </div>
            <button onClick={() => go('/')} className="btn btn-primary" style={{ padding: '11px 22px', fontSize: 14 }}>Importer dans le studio</button>
          </div>
        )}

        {/* nav */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)} className="btn" style={{ padding: '10px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Précédent</button>}
          {step < 3 && (
            <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '10px 20px', opacity: canNext ? 1 : 0.5, cursor: canNext ? 'pointer' : 'not-allowed' }}>Continuer</button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
