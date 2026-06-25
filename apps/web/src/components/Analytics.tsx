import type { CSSProperties, ReactNode } from 'react'
import AppShell from './AppShell'

const card: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 20,
  boxShadow: 'var(--rest)',
}

function Metric({ label, value, delta, up, color }: { label: string; value: string; delta: string; up: boolean; color: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 10 }}>{label}</div>
      <div className="display" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 12, fontWeight: 600, color }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {up ? <path d="M5 19l7-7 4 4 5-9" /> : <path d="M5 5l7 7 4-4 5 9" />}
          {up ? <path d="M21 7v6h-6" /> : <path d="M21 17v-6h-6" />}
        </svg>
        {delta}
      </div>
    </div>
  )
}

function SectionCard({ title, hint, children, style }: { title: string; hint?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...card, ...style }}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{title}</div>
      {hint && <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 16 }}>{hint}</div>}
      {children}
    </div>
  )
}

// missions/jour (7 derniers jours)
const DAYS = [
  { d: 'Lun', v: 9 }, { d: 'Mar', v: 14 }, { d: 'Mer', v: 11 }, { d: 'Jeu', v: 18 },
  { d: 'Ven', v: 22 }, { d: 'Sam', v: 7 }, { d: 'Dim', v: 5 },
]
const COST = [0.9, 1.4, 1.1, 1.8, 2.3, 0.7, 0.5] // $/jour

function BarChart() {
  const max = Math.max(...DAYS.map((d) => d.v))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 150 }}>
      {DAYS.map((d) => (
        <div key={d.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{d.v}</span>
          <div
            style={{
              width: '100%',
              height: `${(d.v / max) * 110}px`,
              borderRadius: '8px 8px 4px 4px',
              background: 'linear-gradient(180deg,#F2A98C,#E07856)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>{d.d}</span>
        </div>
      ))}
    </div>
  )
}

function CostArea() {
  const w = 320, h = 120, pad = 6
  const max = Math.max(...COST)
  const pts = COST.map((v, i) => {
    const x = pad + (i / (COST.length - 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 130 }} aria-hidden="true">
      <defs>
        <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(47,179,163,.32)" />
          <stop offset="1" stopColor="rgba(47,179,163,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#costFill)" />
      <path d={line} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--tealdeep)" />)}
    </svg>
  )
}

const MODELS = [
  { name: 'Claude Opus 4.8', pct: 96, color: '#6A4FB0' },
  { name: 'Claude Sonnet 4.5', pct: 92, color: '#8A6FCB' },
  { name: 'Gemini 3 Pro', pct: 88, color: '#2C74A6' },
  { name: 'Gemini Flash', pct: 79, color: '#3CA7D6' },
]

export default function Analytics() {
  return (
    <AppShell
      active="/analytics"
      title="Analytics"
      subtitle="Productivité · 7 derniers jours"
      contentStyle={{ overflowY: 'auto', padding: '20px 24px 32px' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <Metric label="Missions approuvées / sem." value="86" delta="+18 %" up color="var(--healthy)" />
        <Metric label="Taux de réussite" value="91 %" delta="+3 pts" up color="var(--healthy)" />
        <Metric label="Coût moyen / mission" value="0,14 $" delta="−22 %" up color="var(--healthy)" />
        <Metric label="Temps gagné estimé" value="31 h" delta="+6 h" up color="var(--teal)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Missions livrées / jour" hint="Valeur = missions menées à terme et approuvées (NSM).">
          <BarChart />
        </SectionCard>
        <SectionCard title="Coût par jour ($)" hint="BYOK — tu factures l'orchestration, pas les tokens.">
          <CostArea />
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title="Taux de réussite par modèle" hint="Pour arbitrer le routage qualité / coût.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MODELS.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 130, fontSize: 12, color: 'var(--text2)' }}>{m.name}</span>
                <div style={{ flex: 1, height: 10, borderRadius: 999, background: '#F1EBE2', overflow: 'hidden' }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', borderRadius: 999, background: m.color }} />
                </div>
                <span className="mono" style={{ width: 36, textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>{m.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recommandations de routing" hint="Arbitrage automatique vers le modèle le moins cher capable.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tag: 'Économie', color: 'var(--healthy)', text: 'Router les tests (Probe) vers Gemini Flash : qualité ≥ 95 % du seuil, ', em: '−38 % de coût.' },
              { tag: 'Qualité', color: 'var(--ter)', text: 'Garder l’architecture (Atlas) sur Opus : tâches à fort impact, ', em: 'gain de fiabilité.' },
              { tag: 'Équilibre', color: 'var(--info)', text: 'La doc (Scribe) sur Flash suffit : ', em: 'même résultat, 4× moins cher.' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: '#FCFAF6' }}>
                <span style={{ flex: 'none', marginTop: 1, fontSize: 10, fontWeight: 700, color: '#fff', background: r.color, borderRadius: 999, padding: '2px 8px' }}>{r.tag}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.45 }}>
                  {r.text}<strong style={{ color: 'var(--text)' }}>{r.em}</strong>
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
