import type { CSSProperties, ReactNode } from 'react'
import Plumbob from './Plumbob'
import { BrandMark } from './Plumbob'

/* ---------- helpers ---------- */

function H2({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2
      className="display"
      style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', margin: '0 0 18px', ...style }}
    >
      {children}
    </h2>
  )
}

const card: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 20,
  boxShadow: 'var(--rest)',
}

function Swatch({ color, name, hex, ring, light }: { color: string; name: string; hex: string; ring?: boolean; light?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 62, height: 62, borderRadius: 12, background: color, border: ring ? '1px solid var(--border)' : undefined }} />
      <div style={{ fontSize: 11, marginTop: 6, color: light ? '#B5AB9E' : 'var(--text2)' }}>{name}</div>
      <div className="mono" style={{ fontSize: 10, color: light ? '#8A8073' : 'var(--text3)' }}>{hex}</div>
    </div>
  )
}

const VITAL_ICON: Record<string, ReactNode> = {
  energy: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  motivation: <path d="M12 3c2 4-1 5-1 8a3 3 0 0 0 6 0c0 5-3 9-5 10-3-1-6-5-6-10 0-3 3-4 6-8Z" />,
  mood: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
  clarity: (
    <>
      <path d="M12 3a4 4 0 0 0-4 4 3.5 3.5 0 0 0-1 6.5A3.5 3.5 0 0 0 12 19a3.5 3.5 0 0 0 5-5.5A3.5 3.5 0 0 0 16 7a4 4 0 0 0-4-4Z" />
      <path d="M12 3v16" />
    </>
  ),
}

function SegBar({ kind, label, color, pct }: { kind: string; label: string; color: string; pct: number }) {
  const filled = Math.round((pct / 100) * 12)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 78, fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {VITAL_ICON[kind]}
        </svg>
        {label}
      </span>
      <div style={{ flex: 1, display: 'flex', gap: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 9, borderRadius: 3, background: i < filled ? color : '#F1EBE2' }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', width: 30, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function DsAvatar({ id, from, to, name, tool, children }: { id: string; from: string; to: string; name: string; tool: string; children: ReactNode }) {
  return (
    <div>
      <svg width="84" height="92" viewBox="0 0 120 130" aria-hidden="true">
        <ellipse cx="60" cy="124" rx="30" ry="6" fill="rgba(60,40,20,.14)" />
        <defs>
          <radialGradient id={`af${id}`} cx="35%" cy="26%" r="80%">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </radialGradient>
          <radialGradient id={`ah${id}`} cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#EFE7DC" />
          </radialGradient>
        </defs>
        <rect x="34" y="64" width="52" height="62" rx="26" fill={`url(#af${id})`} />
        <circle cx="60" cy="44" r="25" fill={`url(#ah${id})`} />
        <ellipse cx="51" cy="36" rx="8" ry="5" fill="rgba(255,255,255,.5)" />
        <circle cx="51" cy="46" r="3" fill="#2A251F" />
        <circle cx="69" cy="46" r="3" fill="#2A251F" />
        <path d="M53 56 q7 5 14 0" fill="none" stroke="#2A251F" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="60" cy="96" r="13" fill="rgba(255,255,255,.92)" />
        {children}
      </svg>
      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{name}</div>
      <div style={{ color: 'var(--text3)', fontSize: 11 }}>{tool}</div>
    </div>
  )
}

const btn = (extra: CSSProperties): CSSProperties => ({
  padding: '9px 16px',
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  border: 'none',
  ...extra,
})

/* ---------- la planche ---------- */

export default function DesignSystem() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', padding: '28px 56px 72px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <a href="#/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--text2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Retour au studio
        </a>

        {/* HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <BrandMark size={40} animated />
          <div>
            <h1 className="display" style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
              Roost — Design System
            </h1>
            <p style={{ margin: '5px 0 0', color: 'var(--text2)', fontSize: 15 }}>Productivité chaleureuse rencontre un life-sim attachant.</p>
          </div>
        </header>
        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0 36px' }} />

        {/* ===== COULEURS ===== */}
        <H2>Couleurs</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              Neutres chauds — clair <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(thème principal)</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Swatch color="#FAF7F2" name="Fond" hex="#FAF7F2" ring />
              <Swatch color="#FFFFFF" name="Surface" hex="#FFFFFF" ring />
              <Swatch color="#ECE6DD" name="Bordure" hex="#ECE6DD" />
              <Swatch color="#2A251F" name="Texte" hex="#2A251F" />
              <Swatch color="#6B6358" name="Secondaire" hex="#6B6358" />
            </div>
          </div>
          <div style={{ ...card, background: '#161311', border: '1px solid #322C27' }}>
            <div style={{ fontWeight: 600, marginBottom: 14, color: '#F3EEE7' }}>
              Neutres — charbon chaud <span style={{ color: '#8A8073', fontWeight: 400 }}>(variante sombre)</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Swatch color="#161311" name="Fond" hex="#161311" light />
              <Swatch color="#211D1A" name="Surface" hex="#211D1A" light />
              <Swatch color="#322C27" name="Bordure" hex="#322C27" light />
              <Swatch color="#F3EEE7" name="Texte" hex="#F3EEE7" light />
              <Swatch color="#B5AB9E" name="Secondaire" hex="#B5AB9E" light />
            </div>
          </div>
        </div>

        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Accents &amp; sémantique <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— les états sont toujours doublés d'une icône + d'un libellé</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Swatch color="#E07856" name="Primaire" hex="#E07856" />
            <Swatch color="#2FB3A3" name="Secondaire" hex="#2FB3A3" />
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '0 4px' }} />
            <Swatch color="#3DBE7A" name="Sain" hex="#3DBE7A" />
            <Swatch color="#F2B23C" name="Attention" hex="#F2B23C" />
            <Swatch color="#E5564B" name="Bloqué" hex="#E5564B" />
            <Swatch color="#3CA7D6" name="Info" hex="#3CA7D6" />
            <Swatch color="#A89F92" name="En file" hex="#A89F92" />
          </div>
        </div>

        <div style={{ ...card, marginBottom: 36 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Les 4 Vitals <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— chaque besoin a sa couleur distincte</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Swatch color="#F2A93C" name="⚡ Énergie" hex="#F2A93C" />
            <Swatch color="#F07A3C" name="🍔 Motivation" hex="#F07A3C" />
            <Swatch color="#EC6A86" name="😊 Humeur" hex="#EC6A86" />
            <Swatch color="#3CA7D6" name="🧠 Clarté" hex="#3CA7D6" />
          </div>
        </div>

        {/* ===== TYPOGRAPHIE ===== */}
        <H2>Typographie</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 36 }}>
          <div style={{ ...card, padding: 24 }}>
            {[
              { el: <span className="display" style={{ fontWeight: 700, fontSize: 32, lineHeight: '40px' }}>Display 32</span>, tag: 'Bricolage · 32/40' },
              { el: <span className="display" style={{ fontWeight: 600, fontSize: 24, lineHeight: '32px' }}>Titre H1 24</span>, tag: 'Bricolage · 24/32' },
              { el: <span style={{ fontWeight: 600, fontSize: 20, lineHeight: '28px' }}>Titre H2 20</span>, tag: 'Inter · 20/28' },
              { el: <span style={{ fontSize: 14, lineHeight: '20px' }}>Corps de texte régulier — clair, concret, sans jargon inutile.</span>, tag: 'Inter · 14/20' },
              { el: <span className="mono" style={{ fontSize: 13, color: 'var(--ter)' }}>$ git push origin main</span>, tag: 'JetBrains · 13/20', last: true },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: r.last ? 'none' : '1px dashed var(--border)', paddingBottom: r.last ? 0 : 12, marginBottom: r.last ? 0 : 12 }}>
                {r.el}
                <span className="mono" style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{r.tag}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { font: 'var(--font-display)', weight: 800, name: 'Bricolage Grotesque', use: 'Titres / display', size: 40 },
              { font: 'var(--font-body)', weight: 700, name: 'Inter', use: 'Corps / UI', size: 40 },
              { font: 'var(--font-mono)', weight: 500, name: 'JetBrains Mono', use: 'Code / diffs / logs', size: 38 },
            ].map((f) => (
              <div key={f.name} style={card}>
                <div style={{ fontFamily: f.font, fontWeight: f.weight, fontSize: f.size, lineHeight: 1 }}>Aa</div>
                <div style={{ marginTop: 8, fontWeight: 600 }}>{f.name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>{f.use}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FORMES & OMBRES ===== */}
        <H2>Formes, ombres &amp; boutons</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Rayons &amp; ombres</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {[{ r: 8, l: '8 · champs' }, { r: 12, l: '12 · boutons' }, { r: 16, l: '16 · cartes' }, { r: 999, l: 'pastille' }].map((x) => (
                <div key={x.l} style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: x.r, background: '#F4ECE2', border: '1px solid var(--border)' }} />
                  <div style={{ fontSize: 11, marginTop: 6, color: 'var(--text2)' }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 90, height: 56, borderRadius: 14, background: '#fff', boxShadow: '0 2px 8px rgba(60,40,20,.06)' }} />
                <div style={{ fontSize: 11, marginTop: 10, color: 'var(--text2)' }}>repos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 90, height: 56, borderRadius: 14, background: '#fff', boxShadow: '0 6px 20px rgba(60,40,20,.10)' }} />
                <div style={{ fontSize: 11, marginTop: 10, color: 'var(--text2)' }}>survol</div>
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Boutons &amp; états</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button style={btn({ background: 'var(--ter)', color: '#fff', boxShadow: '0 4px 12px rgba(224,120,86,.35)' })}>Primaire</button>
                <button style={btn({ background: 'var(--terh)', color: '#fff' })}>Survol</button>
                <button style={btn({ background: '#EAD9CE', color: '#C2A998', cursor: 'not-allowed' })}>Désactivé</button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button style={btn({ border: '1px solid var(--ter)', background: 'rgba(224,120,86,.08)', color: 'var(--ter)' })}>Secondaire</button>
                <button style={btn({ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' })}>Ghost</button>
                <button style={btn({ background: 'var(--text)', color: '#fff' })}>Neutre</button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button style={btn({ border: '2px solid var(--ter)', outline: '3px solid rgba(224,120,86,.3)', background: '#fff', color: 'var(--ter)' })}>Focus</button>
                <button style={btn({ background: 'var(--blocked)', color: '#fff' })}>Danger</button>
              </div>
            </div>
            <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 600, fontSize: 13 }}>Puces d'état &amp; badges</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="chip"><span className="dot" style={{ background: 'var(--healthy)' }} />Au travail</span>
              <span className="chip" style={{ background: '#FFF8EC', border: '1px solid #F3DFB4', color: '#A9791C', boxShadow: 'none' }}><span className="dot" style={{ background: 'var(--attention)' }} />Permission</span>
              <span className="chip" style={{ color: '#B83B30' }}><span className="dot" style={{ background: 'var(--blocked)' }} />Bloqué</span>
              <span className="chip" style={{ color: 'var(--text2)' }}><span className="dot" style={{ background: 'var(--pending)' }} />En file · position 3</span>
            </div>
          </div>
        </div>

        {/* ===== MOTIFS SIGNATURE ===== */}
        <H2 style={{ margin: '0 0 18px' }}>Motifs signature</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Plumbob — états de santé</div>
            <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 18 }}>Flotte au-dessus de l'agent · couleur = santé · toujours doublé d'une puce.</div>
            <div style={{ display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'flex-end' }}>
              {[
                { v: 'healthy', l: 'Sain', dur: 3.6 },
                { v: 'attention', l: 'Attention', dur: 4 },
                { v: 'blocked', l: 'Bloqué', dur: 4.2 },
                { v: 'sleeping', l: 'Endormi', dur: 3.6 },
              ].map((p) => (
                <div key={p.l} style={{ textAlign: 'center' }}>
                  <Plumbob variant={p.v as 'healthy'} width={40} height={56} floatDur={p.dur} />
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10, fontWeight: 600 }}>{p.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Barres de Vitals</div>
            <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 18 }}>Segmentées, façon jauges de besoins. Icône + libellé + valeur.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <SegBar kind="energy" label="Énergie" color="#F2A93C" pct={82} />
              <SegBar kind="motivation" label="Motiv." color="#F07A3C" pct={64} />
              <SegBar kind="mood" label="Humeur" color="#EC6A86" pct={90} />
              <SegBar kind="clarity" label="Clarté" color="#3CA7D6" pct={47} />
            </div>
          </div>
        </div>

        {/* ===== AVATARS ===== */}
        <H2 style={{ margin: '36px 0 18px' }}>Galerie d'avatars — une classe, une silhouette</H2>
        <div style={{ ...card, padding: '28px 24px', marginBottom: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 16, textAlign: 'center' }}>
            <DsAvatar id="1" from="#F4889E" to="#D9476A" name="Pixie" tool="Frontend · pinceau">
              <g stroke="#C23E55" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M54 102l9-9 3 3-9 9z" /><path d="M63 93l2-2 3 3-2 2" /></g>
            </DsAvatar>
            <DsAvatar id="2" from="#7BD5C8" to="#1E8C7F" name="Gizmo" tool="Backend · engrenage">
              <g stroke="#1A7468" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="60" cy="96" r="4.2" /><path d="M60 88.5v-2M60 105.5v-2M67.5 96h2M50.5 96h2M65.3 90.7l1.4-1.4M53.3 102.7 54.7 101.3M65.3 101.3l1.4 1.4M53.3 89.3 54.7 90.7" /></g>
            </DsAvatar>
            <DsAvatar id="3" from="#F7C463" to="#D98A18" name="Probe" tool="Tests · loupe">
              <g stroke="#A9791C" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="57" cy="93" r="5.5" /><path d="m61.5 97.5 4 4" /></g>
            </DsAvatar>
            <DsAvatar id="4" from="#7FC0E3" to="#3CA7D6" name="Sage" tool="Recherche · livre">
              <g stroke="#2575A0" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M53 90h14v12H53z" /><path d="M60 90v12" /></g>
            </DsAvatar>
            <DsAvatar id="5" from="#F2A07A" to="#C85F3F" name="Bolt" tool="DevOps · clé">
              <g stroke="#A14C2C" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M65 90a4 4 0 0 1-5 5l-7 7 3 3 7-7a4 4 0 0 1 5-5l-2 2-3-3z" /></g>
            </DsAvatar>
            <DsAvatar id="6" from="#A99BE8" to="#7E6BD9" name="Quill" tool="Docs · plume">
              <g stroke="#5B49B5" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M67 90c-11 2-17 11-16 20" /><path d="M51.5 104c3-5 8-8 14-9" /></g>
            </DsAvatar>
            <DsAvatar id="7" from="#86C7A4" to="#5FA882" name="Sweep" tool="Refacto · étincelles">
              <g fill="#3C7E5C"><path d="M58 88l1.6 4.6 4.6 1.6-4.6 1.6L58 100.4l-1.6-4.6L51.8 94.2l4.6-1.6z" /><path d="M67 98l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" /></g>
            </DsAvatar>
          </div>
        </div>

        {/* ===== ÉTAT VIDE ===== */}
        <H2>État vide type</H2>
        <div style={{ ...card, padding: '44px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <svg width="96" height="104" viewBox="0 0 140 150" style={{ marginBottom: 6, opacity: 0.85 }} aria-hidden="true">
            <ellipse cx="70" cy="142" rx="36" ry="8" fill="rgba(60,40,20,.1)" />
            <defs>
              <radialGradient id="bEmp" cx="35%" cy="26%" r="80%"><stop offset="0" stopColor="#F0E6DA" /><stop offset="1" stopColor="#D9CBBA" /></radialGradient>
              <radialGradient id="hEmp" cx="38%" cy="30%" r="75%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#EFE7DC" /></radialGradient>
            </defs>
            <rect x="40" y="74" width="60" height="64" rx="28" fill="url(#bEmp)" />
            <circle cx="70" cy="48" r="28" fill="url(#hEmp)" />
            <path d="M58 50 q3 -3 7 0 M77 50 q3 -3 7 0" stroke="#A89F92" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M64 62 q6 4 12 0" fill="none" stroke="#A89F92" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <h3 className="display" style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 700 }}>Aucun agent ici</h3>
          <p style={{ margin: '0 0 18px', color: 'var(--text2)', maxWidth: 340 }}>
            Recrute ton premier agent et donne-lui une mission. Tu verras tout ce qu'il fait, en direct.
          </p>
          <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Créer un agent
          </button>
        </div>
      </div>
    </div>
  )
}
