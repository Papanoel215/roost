import { useState, type ReactNode } from 'react'
import AppShell from './AppShell'

type Tab = 'diff' | 'activite'
type Device = 'desktop' | 'tablet' | 'mobile'

const DEVICE_W: Record<Device, number | string> = { desktop: '100%', tablet: 460, mobile: 300 }

const DIFF: { t: 'ctx' | 'add' | 'del' | 'hunk'; text: string }[] = [
  { t: 'hunk', text: '@@ src/components/Navbar.tsx @@' },
  { t: 'del', text: '  <nav className="navbar">' },
  { t: 'add', text: '  <nav aria-label="Principale" className="navbar">' },
  { t: 'ctx', text: '    <Logo />' },
  { t: 'add', text: '    <button aria-expanded={open} onClick={toggle}>' },
  { t: 'add', text: '      <MenuIcon />' },
  { t: 'add', text: '    </button>' },
  { t: 'ctx', text: '  </nav>' },
]
const LINE: Record<string, React.CSSProperties> = {
  ctx: { color: 'var(--text2)' }, add: { color: '#1A7468', background: 'rgba(61,190,122,.12)' },
  del: { color: '#B83B30', background: 'rgba(229,86,75,.10)' }, hunk: { color: 'var(--text3)', background: '#F4ECE2' },
}
const PREFIX: Record<string, string> = { ctx: ' ', add: '+', del: '-', hunk: '' }

const ACTIVITY = [
  { c: 'var(--healthy)', bg: 'rgba(61,190,122,.12)', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6', text: <>Édition <span className="mono">Navbar.tsx</span> <span style={{ color: 'var(--healthy)' }}>+12</span> <span style={{ color: 'var(--blocked)' }}>−3</span></>, t: 'à l\'instant' },
  { c: 'var(--text)', bg: 'rgba(42,37,31,.08)', d: 'M4 5h16v14H4z M8 9l3 3-3 3M13 15h3', text: <><span className="mono">npm run dev</span> → recompilé</>, t: 'il y a 3 s' },
  { c: 'var(--info)', bg: 'rgba(60,167,214,.12)', d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', text: <>Lecture <span className="mono">tailwind.config.ts</span></>, t: 'il y a 20 s' },
]

function DeviceBtn({ d, cur, set, icon }: { d: Device; cur: Device; set: (d: Device) => void; icon: ReactNode }) {
  const on = d === cur
  return (
    <button onClick={() => set(d)} title={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, border: 'none', borderRadius: 8, cursor: 'pointer', background: on ? '#fff' : 'transparent', color: on ? 'var(--text)' : 'var(--text2)', boxShadow: on ? 'var(--rest)' : 'none' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    </button>
  )
}

export default function LivePreview() {
  const [tab, setTab] = useState<Tab>('diff')
  const [device, setDevice] = useState<Device>('desktop')
  const [building, setBuilding] = useState(false)

  const rebuild = () => { setBuilding(true); window.setTimeout(() => setBuilding(false), 1400) }
  const tabStyle = (t: Tab) => ({ padding: '9px 14px', border: 'none', background: 'transparent', borderBottom: `2.5px solid ${tab === t ? 'var(--ter)' : 'transparent'}`, color: tab === t ? 'var(--text)' : 'var(--text3)', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: -1 })

  return (
    <AppShell active="/apercu" title="Aperçu live" subtitle="Pixie · Navbar.tsx — vue scindée" contentStyle={{ display: 'flex', minHeight: 0 }}>
      {/* gauche : diff / activité */}
      <div style={{ width: '46%', flex: 'none', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 4, padding: '8px 14px 0', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setTab('diff')} style={tabStyle('diff')}>Diff</button>
          <button onClick={() => setTab('activite')} style={tabStyle('activite')}>Activité</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', background: '#FCFAF6' }}>
          {tab === 'diff' ? (
            <pre className="mono" style={{ margin: 0, fontSize: 12.5, lineHeight: '20px', padding: '12px 0' }}>
              {DIFF.map((l, i) => (
                <div key={i} style={{ ...LINE[l.t], padding: '0 18px', whiteSpace: 'pre-wrap' }}>
                  <span style={{ userSelect: 'none', opacity: 0.6, marginRight: 8 }}>{PREFIX[l.t]}</span>{l.text}
                </div>
              ))}
            </pre>
          ) : (
            <div style={{ padding: 16 }}>
              {ACTIVITY.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 8, background: e.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: e.c }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={e.d} /></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13 }}>{e.text}</div></div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{e.t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* droite : aperçu */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F1EBE2' }}>
        {/* barre d'outils */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', background: '#F1EBE2', border: '1px solid var(--border)', borderRadius: 9, padding: 3, gap: 2 }}>
            <DeviceBtn d="desktop" cur={device} set={setDevice} icon={<><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8" /></>} />
            <DeviceBtn d="tablet" cur={device} set={setDevice} icon={<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M11 18h2" /></>} />
            <DeviceBtn d="mobile" cur={device} set={setDevice} icon={<><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FBF6EF', border: '1px solid var(--border)', borderRadius: 9, padding: '6px 11px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: building ? 'var(--attention)' : 'var(--healthy)' }} />
            localhost:3000/
          </div>
          <button onClick={rebuild} aria-label="Rafraîchir" style={{ width: 30, height: 30, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={building ? { animation: 'spin 1s linear infinite' } : undefined}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
          </button>
          {[['Console', 'M4 5h16v14H4z M8 9l3 3-3 3M13 15h3'], ['Ouvrir', 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6']].map(([t, d]) => (
            <button key={t} title={t} style={{ width: 30, height: 30, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
            </button>
          ))}
        </div>

        {/* cadre d'appareil */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: DEVICE_W[device], maxWidth: '100%', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--hover)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', background: '#F4EEE5', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5564B' }} /><span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F2B23C' }} /><span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DBE7A' }} />
            </div>
            {building ? (
              <div style={{ padding: '60px 18px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--text2)', fontSize: 13 }}>
                  <span style={{ width: 16, height: 16, border: '2.5px solid var(--ter)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Aperçu en construction…
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F0ECE4', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#E07856,#2FB3A3)' }} /><span className="display" style={{ fontWeight: 800, fontSize: 15 }}>Acme</span></div>
                  {device !== 'mobile' && <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text2)' }}><span>Produit</span><span>Tarifs</span><span>Docs</span><span style={{ background: 'var(--ter)', color: '#fff', padding: '5px 12px', borderRadius: 8, fontWeight: 600 }}>Essayer</span></div>}
                  {device === 'mobile' && <button style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>}
                </div>
                <div style={{ padding: '34px 18px 42px', textAlign: 'center' }}>
                  <div style={{ height: 15, width: '60%', margin: '0 auto 12px', borderRadius: 4, background: '#EFE9E0' }} />
                  <div style={{ height: 15, width: '40%', margin: '0 auto 22px', borderRadius: 4, background: '#EFE9E0' }} />
                  <div style={{ display: 'inline-block', height: 36, width: 140, borderRadius: 9, background: 'var(--ter)' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', padding: '10px', fontSize: 12, color: 'var(--text2)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--healthy)' }} />
          Hot-reload actif · {device}
        </div>
      </div>
    </AppShell>
  )
}
