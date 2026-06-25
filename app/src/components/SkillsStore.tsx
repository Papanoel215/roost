import { useState } from 'react'
import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { AGENTS } from '../data/agents'

interface Connector {
  key: string
  name: string
  glyph: string
  color: string
  category: string
  desc: string
}

const CONNECTORS: Connector[] = [
  { key: 'github', name: 'GitHub', glyph: 'gh', color: '#2A251F', category: 'Code', desc: 'Issues, PR, statut CI et revue de code.' },
  { key: 'linear', name: 'Linear', glyph: 'Li', color: '#5B6AD0', category: 'Gestion', desc: 'Synchronise tickets ↔ missions.' },
  { key: 'slack', name: 'Slack', glyph: 'Sl', color: '#5A3E5D', category: 'Comm', desc: 'Approbations et alertes dans un canal.' },
  { key: 'postgres', name: 'Postgres', glyph: 'Pg', color: '#33679A', category: 'Données', desc: 'Requêtes et migrations de schéma.' },
  { key: 'figma', name: 'Figma', glyph: 'Fi', color: '#C8553D', category: 'Design', desc: 'Lecture des maquettes et tokens.' },
  { key: 'sentry', name: 'Sentry', glyph: 'Se', color: '#6A4FB0', category: 'Observabilité', desc: 'Erreurs et traces de production.' },
  { key: 'notion', name: 'Notion', glyph: 'No', color: '#2A251F', category: 'Docs', desc: 'Lecture/écriture de pages et bases.' },
  { key: 'vercel', name: 'Vercel', glyph: 'Ve', color: '#2A251F', category: 'Déploiement', desc: 'Déploiements et logs runtime.' },
  { key: 'stripe', name: 'Stripe', glyph: 'St', color: '#635BFF', category: 'Paiement', desc: 'Abonnements, factures, webhooks.' },
  { key: 'docker', name: 'Docker', glyph: 'Dk', color: '#2496ED', category: 'Infra', desc: 'Build et exécution de conteneurs.' },
]

const AGENT_KEYS = Object.keys(AGENTS)

function Glyph({ c }: { c: Connector }) {
  return (
    <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14 }}>{c.glyph}</span>
  )
}

export default function SkillsStore() {
  const [sel, setSel] = useState('github')
  const [attached, setAttached] = useState<Record<string, string[]>>({ github: ['pixie', 'gizmo'], sentry: ['probe'] })

  const connector = CONNECTORS.find((c) => c.key === sel)!
  const current = attached[sel] ?? []
  const toggle = (ak: string) => setAttached((a) => {
    const cur = a[sel] ?? []
    return { ...a, [sel]: cur.includes(ak) ? cur.filter((x) => x !== ak) : [...cur, ak] }
  })

  return (
    <AppShell active="/magasin" title="Magasin de compétences" subtitle="Connecteurs MCP · attache-les à tes agents" contentStyle={{ display: 'flex', minHeight: 0 }}>
      {/* catalogue */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {CONNECTORS.map((c) => {
            const on = c.key === sel
            const n = (attached[c.key] ?? []).length
            return (
              <button key={c.key} onClick={() => setSel(c.key)} style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: `1.5px solid ${on ? 'var(--ter)' : 'var(--border)'}`, borderRadius: 16, padding: 16, boxShadow: on ? 'var(--hover)' : 'var(--rest)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Glyph c={c} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.category}</div>
                  </div>
                  {n > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--tealdeep)', background: 'rgba(47,179,163,.12)', borderRadius: 999, padding: '2px 8px' }}>{n} agent{n > 1 ? 's' : ''}</span>}
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.45 }}>{c.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* panneau attacher */}
      <aside style={{ width: 320, flex: 'none', borderLeft: '1px solid var(--border)', padding: 20, overflowY: 'auto', background: '#FCFAF6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Glyph c={connector} />
          <div><div className="display" style={{ fontWeight: 700, fontSize: 17 }}>{connector.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{connector.category}</div></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 18 }}>{connector.desc}</p>

        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Attacher à l'agent</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AGENT_KEYS.map((ak) => {
            const on = current.includes(ak)
            return (
              <button key={ak} onClick={() => toggle(ak)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 11, cursor: 'pointer', background: on ? 'rgba(47,179,163,.08)' : 'var(--surface)', border: `1px solid ${on ? 'var(--teal)' : 'var(--border)'}` }}>
                <MiniAgent agentKey={ak} size={26} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{AGENTS[ak].name}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>· {AGENTS[ak].role}</span>
                <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border)'}`, background: on ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 18, padding: '11px 13px', borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text2)' }}>
          {current.length > 0 ? <><strong style={{ color: 'var(--text)' }}>{connector.name}</strong> est attaché à {current.length} agent{current.length > 1 ? 's' : ''}.</> : `Aucun agent pour l'instant — coche un agent ci-dessus.`}
        </div>
      </aside>
    </AppShell>
  )
}
