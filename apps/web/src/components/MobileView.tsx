import AppShell from './AppShell'
import MiniAgent from './MiniAgent'
import { BrandMark } from './Plumbob'

const bigBtn = {
  flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44,
} as const

export default function MobileView() {
  return (
    <AppShell active="/mobile" title="Mobile · PWA" subtitle="Approuve depuis ton téléphone" contentStyle={{ overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      {/* mock d'appareil */}
      <div style={{ width: 392, flex: 'none', background: '#1B1714', borderRadius: 44, padding: 12, boxShadow: '0 24px 60px rgba(40,25,12,.28)' }}>
        <div style={{ position: 'relative', background: 'var(--bg)', borderRadius: 33, overflow: 'hidden', height: 720 }}>
          {/* encoche */}
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 130, height: 26, background: '#1B1714', borderRadius: 999, zIndex: 5 }} />
          {/* barre d'état */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px 6px', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            <span>9:41</span>
            <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <svg width="16" height="12" viewBox="0 0 18 12" fill="var(--text)" aria-hidden="true"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4" width="3" height="8" rx="1" /><rect x="10" y="1" width="3" height="11" rx="1" opacity=".4" /></svg>
              <svg width="20" height="12" viewBox="0 0 24 12" fill="none" stroke="var(--text)" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="2" width="19" height="8" rx="2" /><rect x="2.5" y="3.5" width="12" height="5" rx="1" fill="var(--text)" stroke="none" /><rect x="21" y="4.5" width="2" height="3" rx="1" fill="var(--text)" stroke="none" /></svg>
            </span>
          </div>

          <div style={{ height: 'calc(100% - 36px)', overflowY: 'auto', padding: '6px 16px 20px' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 2px 14px' }}>
              <BrandMark size={26} />
              <span className="display" style={{ fontWeight: 800, fontSize: 19 }}>Roost</span>
              <span className="topbar-pill" style={{ marginLeft: 'auto', padding: '5px 11px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--vital-energy)' }} />
                <span style={{ fontWeight: 700, fontSize: 12 }}>3,42&nbsp;$</span>
              </span>
            </div>

            {/* mock de notification push */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(6px)', border: '1px solid var(--border)', borderRadius: 16, padding: '11px 13px', boxShadow: 'var(--hover)', marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden' }}><BrandMark size={34} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Roost · maintenant</div>
                <div style={{ fontSize: 12.5, color: 'var(--text2)' }}>Bolt attend une permission : <span className="mono">git push origin main</span></div>
              </div>
            </div>

            {/* qui a besoin de moi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ter)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" /></svg>
              <h2 className="display" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Qui a besoin de moi&nbsp;?</h2>
              <span style={{ background: 'var(--ter)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999 }}>2</span>
            </div>

            {/* carte permission tactile */}
            <div style={{ background: 'var(--surface)', border: '1px solid #F3DFB4', borderRadius: 16, padding: 14, boxShadow: 'var(--rest)', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <MiniAgent agentKey="bolt" size={34} showDot />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Bolt <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>· DevOps</span></div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#A9791C' }}>● Risque moyen</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Demande la permission de lancer :</div>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 12.5, background: '#FBF3EE', border: '1px solid #F0DECF', color: '#9A4E2E', padding: '8px 11px', borderRadius: 10, marginBottom: 12 }}>git push origin main</code>
              <div style={{ display: 'flex', gap: 9 }}>
                <button style={{ ...bigBtn, border: 'none', background: 'var(--ter)', color: '#fff', boxShadow: '0 3px 9px rgba(224,120,86,.32)' }}>Autoriser</button>
                <button style={{ ...bigBtn, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Refuser</button>
              </div>
            </div>

            {/* carte bloqué */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14, boxShadow: 'var(--rest)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <MiniAgent agentKey="probe" size={34} showDot />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Probe <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>· Tests</span></div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#B83B30' }}>● Bloqué</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>3 tests échouent dans <span className="mono" style={{ color: '#9A4E2E' }}>auth.spec.ts</span></div>
              <div style={{ display: 'flex', gap: 9 }}>
                <button style={{ ...bigBtn, border: 'none', background: 'var(--text)', color: '#fff' }}>Voir le diff</button>
                <button style={{ ...bigBtn, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Relancer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
