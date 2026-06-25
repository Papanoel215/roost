import { useState, type CSSProperties } from 'react'
import AppShell from './AppShell'
import AgentBody from './AgentBody'
import Plumbob from './Plumbob'
import { CLASSES } from '../data/classes'
import { TRAITS, ENGINES, MCP_SKILLS } from '../data/traits'
import { go } from '../ui/UiContext'

const label: CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, display: 'block' }
const field: CSSProperties = { width: '100%', border: '1px solid var(--border)', background: '#FBF6EF', borderRadius: 10, padding: '9px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none' }
const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, boxShadow: 'var(--rest)' }

export default function CreateAgent() {
  const [name, setName] = useState('')
  const [classKey, setClassKey] = useState('frontend')
  const [engine, setEngine] = useState('claude')
  const [model, setModel] = useState('claude-sonnet-4-6')
  const [traitKey, setTraitKey] = useState('prudent')
  const [persona, setPersona] = useState('')
  const [skills, setSkills] = useState<string[]>(['GitHub'])
  const [permission, setPermission] = useState<'ASK' | 'AUTO'>('ASK')
  const [budget, setBudget] = useState('Moyen')

  const cls = CLASSES.find((c) => c.key === classKey)!
  const trait = TRAITS.find((t) => t.key === traitKey)!
  const eng = ENGINES.find((e) => e.key === engine)!

  const pickTrait = (k: string) => {
    setTraitKey(k)
    const t = TRAITS.find((x) => x.key === k)!
    setPermission(t.permission)
  }
  const pickEngine = (k: string) => {
    setEngine(k)
    setModel(ENGINES.find((e) => e.key === k)!.models[0])
  }
  const toggleSkill = (s: string) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  return (
    <AppShell active="/creer-agent" title="Créer un agent" subtitle="Mode Construction · composable" contentStyle={{ overflowY: 'auto', padding: '20px 24px 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* aperçu live */}
        <div style={{ ...card, position: 'sticky', top: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, alignSelf: 'flex-start', marginBottom: 4 }}>Aperçu</div>
          <Plumbob variant="healthy" width={34} height={48} />
          <AgentBody id={`new-${classKey}`} width={130} height={163} from={cls.from} to={cls.to} face={cls.face} blush="rgba(255,255,255,.001)">
            {cls.accessory}
          </AgentBody>
          <h2 className="display" style={{ margin: '4px 0 2px', fontSize: 20, fontWeight: 700 }}>{name.trim() || 'Sans nom'}</h2>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>{cls.label} · {cls.tool}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            <span style={{ background: '#F4EEFB', border: '1px solid #E4D8F5', color: '#6A4FB0', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{eng.label} · {model}</span>
            <span style={{ background: 'rgba(224,120,86,.1)', color: 'var(--ter)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{trait.emoji} {trait.label}</span>
            <span style={{ background: '#F4ECE2', color: 'var(--text2)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{permission} · {trait.maxTurns} tours</span>
          </div>
        </div>

        {/* formulaire */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* identité */}
          <div style={card}>
            <span style={label}>Identité</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'agent (ex : Atlas, Pixel…)" style={{ ...field, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CLASSES.map((c) => {
                const on = c.key === classKey
                return (
                  <button key={c.key} onClick={() => setClassKey(c.key)} title={c.label}
                    style={{ width: 84, padding: '8px 4px 6px', borderRadius: 12, cursor: 'pointer', background: on ? 'rgba(224,120,86,.08)' : 'var(--surface)', border: `1px solid ${on ? 'var(--ter)' : 'var(--border)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <AgentBody id={`pick-${c.key}`} width={44} height={55} from={c.from} to={c.to} face={c.face} shadowRx={36} shadowRy={7} shadowOpacity={0.12}>{c.accessory}</AgentBody>
                    <span style={{ fontSize: 11, fontWeight: 600, color: on ? 'var(--ter)' : 'var(--text2)', marginTop: 2 }}>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* cerveau */}
          <div style={card}>
            <span style={label}>Cerveau</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 6 }}>Moteur</div>
                <div style={{ display: 'flex', background: '#F1EBE2', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 3 }}>
                  {ENGINES.map((e) => (
                    <button key={e.key} onClick={() => pickEngine(e.key)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: engine === e.key ? '#fff' : 'transparent', color: engine === e.key ? 'var(--text)' : 'var(--text2)', boxShadow: engine === e.key ? 'var(--rest)' : 'none' }}>{e.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 6 }}>Modèle</div>
                <select value={model} onChange={(e) => setModel(e.target.value)} style={{ ...field, fontFamily: 'var(--font-mono)' }}>
                  {eng.models.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* personnalité = trait */}
          <div style={card}>
            <span style={label}>Personnalité — choisis un trait</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRAITS.map((t) => {
                const on = t.key === traitKey
                return (
                  <button key={t.key} onClick={() => pickTrait(t.key)}
                    style={{ textAlign: 'left', cursor: 'pointer', borderRadius: 12, padding: 13, background: on ? 'rgba(224,120,86,.06)' : 'var(--surface)', border: `1.5px solid ${on ? 'var(--ter)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ fontSize: 16 }}>{t.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t.label}</span>
                      <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)' }}>{t.permission} · {t.maxTurns}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.45 }}>{t.blurb}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* persona */}
          <div style={card}>
            <span style={label}>Persona</span>
            <textarea value={persona} onChange={(e) => setPersona(e.target.value)} rows={3} placeholder="« Tu construis des interfaces propres et accessibles. Tu respectes strictement les design tokens… »" style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          {/* compétences + permissions + budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <span style={label}>Compétences (MCP)</span>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {MCP_SKILLS.map((s) => {
                  const on = skills.includes(s)
                  return (
                    <button key={s} onClick={() => toggleSkill(s)}
                      style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '5px 11px', background: on ? 'rgba(47,179,163,.12)' : 'var(--surface)', border: `1px solid ${on ? 'var(--teal)' : 'var(--border)'}`, color: on ? 'var(--tealdeep)' : 'var(--text2)' }}>
                      {on ? '✓ ' : '+ '}{s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={card}>
              <span style={label}>Permissions & budget</span>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                {(['ASK', 'AUTO'] as const).map((p) => (
                  <button key={p} onClick={() => setPermission(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: permission === p ? (p === 'ASK' ? 'rgba(224,120,86,.1)' : 'rgba(242,178,60,.14)') : 'var(--surface)', border: `1px solid ${permission === p ? (p === 'ASK' ? 'var(--ter)' : 'var(--attention)') : 'var(--border)'}`, color: permission === p ? 'var(--text)' : 'var(--text2)' }}>{p === 'ASK' ? 'ASK (demande)' : 'AUTO'}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Bas', 'Moyen', 'Élevé'].map((b) => (
                  <button key={b} onClick={() => setBudget(b)} style={{ flex: 1, padding: '7px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: budget === b ? '#fff' : '#F4ECE2', border: `1px solid ${budget === b ? 'var(--ter)' : 'var(--border)'}`, color: budget === b ? 'var(--text)' : 'var(--text2)' }}>{b}</button>
                ))}
              </div>
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <a href="#/" className="btn" style={{ padding: '10px 18px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', textDecoration: 'none' }}>Annuler</a>
            <button onClick={() => go('/')} disabled={!name.trim()} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '10px 20px', fontSize: 14, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              Recruter l'agent
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
