import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import AgentBody from './AgentBody'
import Plumbob from './Plumbob'
import { AGENTS, STATE_CHIP, type AgentDef } from '../data/agents'
import { IconActivity, IconHelpCircle, IconAlert, IconPlus } from './icons'

/* ---------- positions par défaut (éditables en Mode Construction) ---------- */
const DEFAULTS: Record<string, { left: string; top: string }> = {
  probe:    { left: '32%', top:  '8%' },
  sentinel: { left: '73%', top: '13%' },
  pixel:    { left: '22%', top: '46%' },
  forge:    { left: '63%', top: '40%' },
  atlas:    { left: '45%', top: '60%' },
  scribe:   { left: '78%', top: '58%' },
}

/* Stable single-char IDs for SVG gradient namespacing */
const AGENT_SVG_ID: Record<string, string> = {
  atlas: 'A', pixel: 'L', probe: 'R', sentinel: 'N', scribe: 'W', forge: 'F',
}

const AGENT_SCALE: Record<string, number> = {
  atlas: 1.08, pixel: 1.04, probe: 0.84, sentinel: 0.82, scribe: 0.82, forge: 1.0,
}

const AGENT_Z: Record<string, number> = {
  atlas: 8, pixel: 6, probe: 2, sentinel: 2, scribe: 2, forge: 5,
}

const BREATHE: Record<string, [number, number]> = {
  atlas:    [2.8, 0.3],
  pixel:    [2.6, 0.0],
  probe:    [3.4, 0.2],
  sentinel: [5.0, 0.8],
  scribe:   [5.0, 0.5],
  forge:    [3.0, 0.4],
}

/* ---------- sub-components ---------- */

function Bubble({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '7px 12px', boxShadow: 'var(--hover)', fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', ...style }}>
      {children}
    </div>
  )
}

function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text3)', animation: `dot 1.2s infinite ${d}s` }} />
      ))}
    </span>
  )
}

function Chip({ state }: { state: AgentDef['state'] }) {
  const chip = STATE_CHIP[state]
  const isPermission = state === 'permission'
  const isSleeping = state === 'sleeping'
  return (
    <div style={{ marginTop: 2, background: isPermission ? '#FFF8EC' : isSleeping ? 'transparent' : 'var(--surface)', border: isPermission ? '1px solid #F3DFB4' : '1px solid var(--border)', borderRadius: 999, padding: '4px 11px', boxShadow: isSleeping ? 'none' : 'var(--rest)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isPermission ? '#A9791C' : 'var(--text)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: chip.dot, animation: chip.pulse ? 'pulse-ring 2s ease-out infinite' : undefined }} />
      {chip.label}
    </div>
  )
}

function AgentBubble({ agent }: { agent: AgentDef }) {
  if (agent.state === 'sleeping') {
    return (
      <div style={{ position: 'relative', height: 30, width: 60, marginBottom: 2 }}>
        {[{ left: 6, size: 13, delay: 0 }, { left: 18, size: 16, delay: 1 }, { left: 32, size: 20, delay: 2 }].map((z, i) => (
          <span key={i} className="display" style={{ position: 'absolute', left: z.left, fontWeight: 700, color: 'var(--text3)', fontSize: z.size, animation: `zzz 3s ease-in-out infinite ${z.delay}s` }}>
            {i === 2 ? 'Z' : 'z'}
          </span>
        ))}
      </div>
    )
  }
  if (agent.state === 'permission') {
    return (
      <Bubble style={{ background: '#FFF8EC', border: '1px solid #F3DFB4', color: '#A9791C', fontWeight: 600 }}>
        <IconHelpCircle size={13} />En attente de toi
      </Bubble>
    )
  }
  if (agent.state === 'blocked') {
    return (
      <Bubble style={{ border: '1px solid #F2C9C4', color: '#B83B30', boxShadow: 'var(--hover)' }}>
        <IconAlert size={13} stroke={2.4} />{agent.task.slice(0, 28)}
      </Bubble>
    )
  }
  return (
    <Bubble>
      <IconActivity size={13} color="var(--teal)" />
      {agent.taskFile
        ? <><span style={{ color: 'var(--text2)' }}>Édite</span> <span className="mono" style={{ color: 'var(--ter)' }}>{agent.taskFile}</span></>
        : <span style={{ color: 'var(--text2)' }}>{agent.task.slice(0, 26)}</span>
      }
      <Dots />
    </Bubble>
  )
}

/* ---------- Sprite (drag-and-drop en mode Construction) ---------- */

function Sprite({ agentKey, left, top, scale, z, construction, onMove, onOpen, label, children }: {
  agentKey: string; left: string; top: string; scale: number; z: number
  construction: boolean; onMove: (k: string, l: string, t: string) => void
  onOpen: () => void; label: string; children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false })

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!construction) return
    drag.current = { active: true, moved: false }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!construction || !drag.current.active) return
    const parent = ref.current?.offsetParent as HTMLElement | null
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const lx = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100))
    const ty = Math.max(2, Math.min(82, ((e.clientY - rect.top) / rect.height) * 100))
    drag.current.moved = true
    onMove(agentKey, `${lx.toFixed(1)}%`, `${ty.toFixed(1)}%`)
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current.active) {
      drag.current.active = false
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
    }
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => { if (!drag.current.moved) onOpen() }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute', left, top,
        transform: `translateX(-50%) scale(${scale})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: z,
        cursor: construction ? 'grab' : 'pointer',
        touchAction: construction ? 'none' : undefined,
        transition: drag.current.active ? 'none' : 'left .12s ease, top .12s ease',
        outline: construction ? '1.5px dashed rgba(47,179,163,.6)' : undefined,
        outlineOffset: construction ? 6 : undefined,
        borderRadius: 14,
      } as CSSProperties}
    >
      {children}
    </div>
  )
}

/* ---------- Scene principale ---------- */

export default function Scene({ showGrid, onOpenAgent }: { showGrid: boolean; onOpenAgent: (key: string) => void }) {
  const [pos, setPos] = useState(() => {
    const base = { ...DEFAULTS }
    for (const key of Object.keys(AGENTS)) {
      if (!base[key]) base[key] = { left: '50%', top: '50%' }
    }
    return base
  })
  const onMove = (key: string, left: string, top: string) => setPos((p) => ({ ...p, [key]: { left, top } }))

  return (
    <section style={{
      flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'radial-gradient(130% 100% at 28% 8%,#FCF3E4 0%,#F0DEC4 52%,#E4CDA8 100%)',
      boxShadow: 'inset 0 0 60px rgba(120,80,40,.10),var(--rest)',
      minHeight: 430,
    }}>
      {/* ambient layers */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 55% at 16% 0%,rgba(255,248,225,.85),rgba(255,248,225,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px),repeating-linear-gradient(-30deg,rgba(120,80,40,.05) 0 1px,transparent 1px 46px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 100% at 50% 60%,transparent 55%,rgba(90,60,30,.16) 100%)', pointerEvents: 'none' }} />
      {showGrid && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(30deg,rgba(47,179,163,.5) 0 1.5px,transparent 1.5px 46px),repeating-linear-gradient(-30deg,rgba(47,179,163,.5) 0 1.5px,transparent 1.5px 46px)', pointerEvents: 'none' }} />}

      {/* décor */}
      <svg style={{ position: 'absolute', left: 24, bottom: 18, width: 84 }} viewBox="0 0 90 120" aria-hidden="true">
        <g style={{ transformOrigin: '45px 95px', animation: 'leaf 5s ease-in-out infinite' }}>
          <path d="M45 70 C20 60 14 30 30 16 C40 38 44 50 45 70Z" fill="#5FA882" />
          <path d="M45 70 C70 58 78 26 60 14 C48 36 46 50 45 70Z" fill="#4F9873" />
          <path d="M45 72 C45 44 47 26 47 14" fill="none" stroke="#3C7E5C" strokeWidth="2" />
        </g>
        <path d="M28 70 H62 L57 108 H33 Z" fill="#CC6747" />
        <path d="M28 70 H62 L60 80 H30 Z" fill="#E07856" />
      </svg>
      <svg style={{ position: 'absolute', right: 34, top: 8, width: 70 }} viewBox="0 0 80 110" aria-hidden="true">
        <path d="M40 0 V18" stroke="#C9A37A" strokeWidth="2" />
        <path d="M14 32 H66 L60 48 H20 Z" fill="#B8946C" />
        <g style={{ transformOrigin: '40px 46px', animation: 'leaf 6s ease-in-out infinite' }}>
          <path d="M22 46 C8 64 6 88 18 100 C24 80 24 62 22 46Z" fill="#5FA882" />
          <path d="M40 48 C38 74 40 96 40 104 C44 84 44 64 40 48Z" fill="#4F9873" />
          <path d="M58 46 C72 64 74 86 62 98 C56 80 56 62 58 46Z" fill="#67B08A" />
        </g>
      </svg>

      {showGrid && (
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.86)', backdropFilter: 'blur(6px)', border: '1px solid var(--border)', borderRadius: 999, padding: '7px 8px 7px 16px', boxShadow: 'var(--hover)' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text2)' }}>Mode Construction — glisse un agent pour le placer</span>
          <a href="#/creer-agent" className="btn btn-primary" style={{ textDecoration: 'none', padding: '6px 13px', fontSize: 12.5 }}><IconPlus size={14} />Recruter</a>
        </div>
      )}

      <div style={{ position: 'absolute', left: '50%', top: '62%', width: 560, height: 230, transform: 'translate(-50%,-50%)', background: 'radial-gradient(closest-side,rgba(224,120,86,.16),rgba(224,120,86,.04) 70%,transparent)', borderRadius: '50%' }} />

      {/* ============ AGENTS (data-driven) ============ */}
      {Object.values(AGENTS).map((agent) => {
        const p = pos[agent.key] ?? { left: '50%', top: '50%' }
        const scale = AGENT_SCALE[agent.key] ?? 1.0
        const z = AGENT_Z[agent.key] ?? 4
        const [breatheDur, breatheDelay] = BREATHE[agent.key] ?? [3, 0]
        const svgId = AGENT_SVG_ID[agent.key] ?? agent.key[0].toUpperCase()
        const isSleeping = agent.state === 'sleeping'
        const isPermission = agent.state === 'permission'

        return (
          <Sprite
            key={agent.key}
            agentKey={agent.key}
            left={p.left}
            top={p.top}
            scale={scale}
            z={z}
            construction={showGrid}
            onMove={onMove}
            onOpen={() => onOpenAgent(agent.key)}
            label={`Ouvrir la fiche de ${agent.name}`}
          >
            <AgentBubble agent={agent} />

            <Plumbob
              variant={agent.plumbob}
              width={isSleeping ? 30 : isPermission ? 35 : 36}
              height={isSleeping ? 42 : isPermission ? 49 : 50}
              floatDur={isSleeping ? undefined : isPermission ? 3.8 : 3.6}
              floatDelay={isPermission ? 0.6 : 0}
              sparkDur={isSleeping ? undefined : 1.7}
            />

            {isPermission && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '50%', top: '58%', width: 120, height: 120, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(242,178,60,.34),transparent)', animation: 'halo 2.4s ease-in-out infinite', pointerEvents: 'none' }} />
                <AgentBody
                  id={svgId}
                  width={128} height={160}
                  from={agent.avatar.from} to={agent.avatar.to}
                  face={agent.avatar.face}
                  blush={agent.avatar.blush}
                  arms={agent.avatar.arms}
                  mouth="M61 67 q9 4 18 0"
                  breatheDur={breatheDur}
                  breatheDelay={breatheDelay}
                  shadowRx={40} shadowOpacity={0.16}
                >
                  {agent.avatar.accessory}
                </AgentBody>
              </div>
            )}

            {!isPermission && (
              <AgentBody
                id={svgId}
                width={isSleeping ? 120 : 132}
                height={isSleeping ? 150 : 165}
                from={agent.avatar.from}
                to={agent.avatar.to}
                face={agent.avatar.face}
                highlight={agent.avatar.highlight}
                blush={agent.avatar.blush}
                arms={agent.avatar.arms}
                grayscale={isSleeping ? 0.45 : undefined}
                opacity={isSleeping ? 0.78 : undefined}
                breatheAnim={isSleeping ? 'breathe-slow' : undefined}
                breatheDur={breatheDur}
                breatheDelay={breatheDelay}
                shadowRx={40}
                shadowOpacity={isSleeping ? 0.13 : 0.18}
              >
                {agent.avatar.accessory}
              </AgentBody>
            )}

            <div style={{ marginTop: 2, background: isPermission ? '#FFF8EC' : isSleeping ? 'transparent' : 'var(--surface)', border: isPermission ? '1px solid #F3DFB4' : '1px solid var(--border)', borderRadius: 999, padding: '4px 11px', boxShadow: isSleeping ? 'none' : 'var(--rest)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isPermission ? '#A9791C' : isSleeping ? 'var(--text2)' : 'var(--text)', whiteSpace: 'nowrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATE_CHIP[agent.state].dot }} />
              {agent.name} · {agent.role} · {STATE_CHIP[agent.state].label}
            </div>
          </Sprite>
        )
      })}
    </section>
  )
}
