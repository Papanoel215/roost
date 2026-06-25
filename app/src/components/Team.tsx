import { useState, type CSSProperties } from 'react'
import AppShell from './AppShell'

type Role = 'Admin' | 'Membre' | 'Observateur'
type Presence = 'online' | 'away' | 'offline'

interface Member {
  id: string
  name: string
  email: string
  from: string
  to: string
  role: Role
  presence: Presence
  seen: string
  you?: boolean
}

const PRESENCE: Record<Presence, { label: string; color: string }> = {
  online: { label: 'En ligne', color: 'var(--healthy)' },
  away: { label: 'Absent', color: 'var(--attention)' },
  offline: { label: 'Hors ligne', color: 'var(--pending)' },
}

const INITIAL: Member[] = [
  { id: 'u1', name: 'Maxime', email: 'maxime@gmail.com', from: '#8FD9CC', to: '#2FB3A3', role: 'Admin', presence: 'online', seen: 'maintenant', you: true },
  { id: 'u2', name: 'Léa', email: 'lea@roost.studio', from: '#F4C77A', to: '#E07856', role: 'Membre', presence: 'online', seen: 'maintenant' },
  { id: 'u3', name: 'Tom', email: 'tom@roost.studio', from: '#A99BE8', to: '#7E6BD9', role: 'Membre', presence: 'away', seen: 'il y a 12 min' },
  { id: 'u4', name: 'Noa', email: 'noa@roost.studio', from: '#F4889E', to: '#D9476A', role: 'Observateur', presence: 'offline', seen: 'hier' },
]

function Avatar({ m, size = 36 }: { m: { name: string; from: string; to: string }; size?: number }) {
  return (
    <span style={{ width: size, height: size, flex: 'none', borderRadius: '50%', background: `radial-gradient(circle at 32% 28%,${m.from},${m.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.42, boxShadow: 'var(--rest)' }}>{m.name[0]}</span>
  )
}

const select: CSSProperties = { border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 9, padding: '6px 9px', fontSize: 12.5, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-body)' }

const COMMENTS = [
  { name: 'Léa', from: '#F4C77A', to: '#E07856', t: 'il y a 8 min', text: <>Le menu mobile est nickel 👌 On garde bien le <strong>focus ring</strong> visible au clavier ?</> },
  { name: 'Maxime', from: '#8FD9CC', to: '#2FB3A3', t: 'il y a 5 min', text: <>Oui, focus ring obligatoire (AA). Sinon LGTM — on peut approuver.</> },
]

export default function Team() {
  const [members, setMembers] = useState<Member[]>(INITIAL)
  const setRole = (id: string, role: Role) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)))
  const online = members.filter((m) => m.presence === 'online').length

  return (
    <AppShell active="/equipe" title="Équipe" subtitle={`Studio partagé · ${members.length} membres · ${online} en ligne`} contentStyle={{ display: 'flex', minHeight: 0 }}>
      {/* membres */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 16, fontWeight: 700 }}>Membres</span>
          <span style={{ marginLeft: 'auto' }} />
          <button className="btn btn-primary" style={{ padding: '8px 14px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M16 19v-6M13 16h6M11 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM2 21a7 7 0 0 1 12-4.9" /></svg>
            Inviter un membre
          </button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--rest)', overflow: 'hidden' }}>
          {members.map((m, i) => {
            const p = PRESENCE[m.presence]
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ position: 'relative', flex: 'none' }}>
                  <Avatar m={m} />
                  <span style={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', background: p.color, border: '2px solid var(--surface)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                    {m.you && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tealdeep)', background: 'rgba(47,179,163,.14)', borderRadius: 999, padding: '1px 7px' }}>TOI</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.email}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)', width: 96 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />{p.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text3)', width: 90 }}>{m.seen}</span>
                <select value={m.role} disabled={m.you} onChange={(e) => setRole(m.id, e.target.value as Role)} style={{ ...select, opacity: m.you ? 0.6 : 1, cursor: m.you ? 'not-allowed' : 'pointer' }}>
                  <option>Admin</option><option>Membre</option><option>Observateur</option>
                </select>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
          <span><strong style={{ color: 'var(--text2)' }}>Admin</strong> — gère l'équipe, les budgets, dépense.</span>
          <span><strong style={{ color: 'var(--text2)' }}>Membre</strong> — lance & approuve.</span>
          <span><strong style={{ color: 'var(--text2)' }}>Observateur</strong> — lecture seule.</span>
        </div>
      </div>

      {/* fil de commentaires */}
      <aside style={{ width: 350, flex: 'none', borderLeft: '1px solid var(--border)', background: '#FCFAF6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Commentaires d'artefact</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
            <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%,#F4889E,#D9476A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>P</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Navbar.tsx · PR #214</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Pixie · à réviser</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#A9791C', background: 'rgba(242,178,60,.16)', borderRadius: 999, padding: '2px 8px' }}>À RÉVISER</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {COMMENTS.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <Avatar m={c} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{c.t}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', padding: '9px 12px' }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FBF6EF', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 10px 8px 13px' }}>
            <span style={{ flex: 1, color: 'var(--text3)', fontSize: 13 }}>Commenter, @mentionner…</span>
            <button style={{ width: 32, height: 32, border: 'none', background: 'var(--ter)', color: '#fff', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 9px rgba(224,120,86,.3)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" /></svg>
            </button>
          </div>
        </div>
      </aside>
    </AppShell>
  )
}
