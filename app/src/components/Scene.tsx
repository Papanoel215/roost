import {
  useRef,
  useState,
  useEffect,
  useMemo,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { AGENTS, STATE_CHIP, type AgentDef } from '../data/agents'
import { IconActivity, IconHelpCircle, IconAlert, IconPlus } from './icons'
import { useAllAgentsRuntimeStates, useActivityLogs, addLog, updateAgentState } from '../lib/agentState'
import { useAgentStats } from '../lib/gamification'

/* ─────────────────────────────────────────────────────────
   POSITIONS & DISPLAY CONFIG
───────────────────────────────────────────────────────── */
const DEFAULTS: Record<string, { left: string; top: string }> = {
  probe:    { left: '22%', top: '18%' },
  sentinel: { left: '50%', top: '14%' },
  pixel:    { left: '78%', top: '18%' },
  forge:    { left: '22%', top: '52%' },
  atlas:    { left: '50%', top: '48%' },
  scribe:   { left: '78%', top: '52%' },
}

const AGENT_Z: Record<string, number> = {
  atlas: 8, pixel: 6, probe: 4, sentinel: 4, scribe: 4, forge: 5,
}

/* ─────────────────────────────────────────────────────────
   PARTICLE CONFIG  (generated once, stable)
───────────────────────────────────────────────────────── */
interface ParticleDef {
  id: number; left: string; top: string; size: number
  dur: number; delay: number; color: string
}

const PARTICLES: ParticleDef[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 4.7 + (i % 3) * 8.3) % 90}%`,
  top:  `${3 + (i * 5.3 + (i % 5) * 6.1) % 88}%`,
  size: 2 + (i % 4),
  dur:  6 + (i % 7),
  delay: (i * 0.7) % 5,
  color: i % 4 === 0 ? '#2FB3A3' : i % 4 === 1 ? '#8FADD4' : i % 4 === 2 ? '#E8C86D' : '#F4889E',
}))

/* ─────────────────────────────────────────────────────────
   CSS AVATAR SPRITES  (pure CSS, no external assets)
   Each returns a <div> tree using border-radius tricks.
───────────────────────────────────────────────────────── */

/* Shared sprite shell that sizes and stacks layers */
function AvatarShell({
  size = 72,
  children,
  style,
}: { size?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Atlas — wise elder: amber robe + book ── */
function AvatarAtlas({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={76}>
      {/* Robe/body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 52, height: 46,
        background: 'linear-gradient(180deg,#E8C86D,#A87D1A)',
        borderRadius: '8px 8px 22px 22px',
        boxShadow: glow ? '0 0 18px #E8C86D88' : undefined,
      }} />
      {/* Head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 40, height: 38,
        background: 'linear-gradient(160deg,#F4D48A,#C8941E)',
        borderRadius: '50% 50% 42% 42% / 56% 56% 44% 44%',
        border: '2px solid #2E222F',
      }}>
        {/* Eyes */}
        <div style={{ position: 'absolute', top: 14, left: 8, width: 6, height: 6, borderRadius: '50%', background: '#2E222F' }} />
        <div style={{ position: 'absolute', top: 14, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#2E222F' }} />
        {/* Wise brows */}
        <div style={{ position: 'absolute', top: 10, left: 6, width: 9, height: 2, borderRadius: 2, background: '#A87D1A', transform: 'rotate(-8deg)' }} />
        <div style={{ position: 'absolute', top: 10, right: 6, width: 9, height: 2, borderRadius: 2, background: '#A87D1A', transform: 'rotate(8deg)' }} />
        {/* Smile */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 14, height: 6, borderBottom: '3px solid #7A5010', borderRadius: '0 0 50% 50%' }} />
        {/* Beard */}
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 22, height: 10, background: '#F4D48A', borderRadius: '0 0 12px 12px', opacity: 0.8 }} />
      </div>
      {/* Book accessory */}
      <div style={{
        position: 'absolute', bottom: 16, right: 0,
        width: 14, height: 18,
        background: '#3D5F8A',
        borderRadius: 2,
        border: '1.5px solid #2E222F',
        boxShadow: '1px 1px 0 #2575A0',
      }}>
        <div style={{ position: 'absolute', left: 2, top: 3, width: 8, height: 1.5, background: '#8FADD4', borderRadius: 1 }} />
        <div style={{ position: 'absolute', left: 2, top: 6, width: 6, height: 1.5, background: '#8FADD4', borderRadius: 1 }} />
        <div style={{ position: 'absolute', left: 2, top: 9, width: 7, height: 1.5, background: '#8FADD4', borderRadius: 1 }} />
      </div>
    </AvatarShell>
  )
}

/* ── Pixel — tech/creative: cyan square head + pixel grid ── */
function AvatarPixel({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={72}>
      {/* Body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 46, height: 42,
        background: 'linear-gradient(180deg,#F4889E,#D9476A)',
        borderRadius: '6px 6px 18px 18px',
        boxShadow: glow ? '0 0 18px #F4889E88' : undefined,
      }}>
        {/* Shirt detail */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
      </div>
      {/* Square head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 42, height: 40,
        background: 'linear-gradient(135deg,#F9AABB,#E85878)',
        borderRadius: 6,
        border: '2px solid #2E222F',
      }}>
        {/* Pixel grid inside */}
        <div style={{
          position: 'absolute', inset: 4,
          backgroundImage: 'repeating-linear-gradient(0deg,rgba(46,34,47,.12) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(46,34,47,.12) 0 1px,transparent 1px 4px)',
        }} />
        {/* Eyes */}
        <div style={{ position: 'absolute', top: 12, left: 7, width: 7, height: 7, borderRadius: 1, background: '#2E222F' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#fff', borderRadius: 0 }} />
        </div>
        <div style={{ position: 'absolute', top: 12, right: 7, width: 7, height: 7, borderRadius: 1, background: '#2E222F' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#fff', borderRadius: 0 }} />
        </div>
        {/* Mouth pixel */}
        <div style={{ position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
          {[0, 1, 2, 3].map((x) => (
            <div key={x} style={{ width: 4, height: 4, borderRadius: 0, background: x === 0 || x === 3 ? 'transparent' : '#2E222F' }} />
          ))}
        </div>
      </div>
      {/* Paintbrush */}
      <div style={{
        position: 'absolute', bottom: 20, right: -4,
        width: 5, height: 22, background: '#8B4513',
        borderRadius: 2, border: '1px solid #2E222F',
        transform: 'rotate(15deg)',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: -1, width: 7, height: 7, borderRadius: '2px 2px 4px 4px', background: '#2FB3A3' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 3, height: 4, background: '#C0C0C0', borderRadius: '1px 1px 0 0' }} />
      </div>
    </AvatarShell>
  )
}

/* ── Probe — investigator: round glasses + trench coat shape ── */
function AvatarProbe({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={68}>
      {/* Trench coat body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 50, height: 44,
        background: 'linear-gradient(180deg,#F7C463,#B07818)',
        borderRadius: '4px 4px 20px 20px',
        boxShadow: glow ? '0 0 18px #F7C46388' : undefined,
      }}>
        {/* Collar lapels */}
        <div style={{ position: 'absolute', top: 0, left: 6, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '16px solid #D98A18', opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: 0, right: 6, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '16px solid #D98A18', opacity: 0.7 }} />
      </div>
      {/* Head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 38, height: 36,
        background: 'linear-gradient(160deg,#FAD88A,#C8941E)',
        borderRadius: '50% 50% 44% 44% / 56% 56% 44% 44%',
        border: '2px solid #2E222F',
      }}>
        {/* Glasses frames */}
        <div style={{ position: 'absolute', top: 12, left: 3, display: 'flex', gap: 2 }}>
          <div style={{ width: 13, height: 10, borderRadius: '50%', border: '2px solid #2E222F', background: 'rgba(143,173,212,0.35)' }} />
          <div style={{ width: 13, height: 10, borderRadius: '50%', border: '2px solid #2E222F', background: 'rgba(143,173,212,0.35)' }} />
        </div>
        {/* Mouth */}
        <div style={{ position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)', width: 10, height: 4, borderBottom: '2.5px solid #7A5010', borderRadius: '0 0 50% 50%' }} />
      </div>
      {/* Magnifier */}
      <div style={{
        position: 'absolute', bottom: 18, right: -2,
        width: 16, height: 16,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2.5px solid #2E222F', background: 'rgba(143,173,212,0.4)' }} />
        <div style={{ position: 'absolute', bottom: -3, right: -1, width: 6, height: 2.5, background: '#2E222F', borderRadius: 2, transform: 'rotate(45deg)' }} />
      </div>
    </AvatarShell>
  )
}

/* ── Sentinel — guardian: angular shield shape, deep blue ── */
function AvatarSentinel({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={70}>
      {/* Armor body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 52, height: 44,
        background: 'linear-gradient(180deg,#8FADD4,#3D5F8A)',
        borderRadius: '4px 4px 8px 8px',
        boxShadow: glow ? '0 0 18px #8FADD488' : undefined,
        clipPath: 'polygon(0 0,100% 0,100% 80%,50% 100%,0 80%)',
      }}>
        {/* Chest chevron */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '14px solid rgba(255,255,255,0.2)' }} />
      </div>
      {/* Helmet head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 42, height: 40,
        background: 'linear-gradient(160deg,#A8C4E8,#4A72A8)',
        borderRadius: '50% 50% 30% 30% / 50% 50% 50% 50%',
        border: '2px solid #2E222F',
      }}>
        {/* Visor slit */}
        <div style={{ position: 'absolute', top: 13, left: 6, right: 6, height: 8, background: '#0D1B3E', borderRadius: 3, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.5)' }}>
          {/* Visor glow line */}
          <div style={{ position: 'absolute', top: '50%', left: 4, right: 4, height: 1.5, background: '#4DC8E8', opacity: 0.9, borderRadius: 1 }} />
        </div>
        {/* Chin guard */}
        <div style={{ position: 'absolute', bottom: 4, left: 8, right: 8, height: 8, background: '#3D5F8A', borderRadius: '0 0 6px 6px', border: '1px solid #2E222F' }} />
      </div>
    </AvatarShell>
  )
}

/* ── Scribe — scholar: warm gold scrolls, spectacles ── */
function AvatarScribe({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={68}>
      {/* Robes */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 44,
        background: 'linear-gradient(180deg,#7BD5C8,#1E8C7F)',
        borderRadius: '6px 6px 18px 18px',
        boxShadow: glow ? '0 0 18px #7BD5C888' : undefined,
      }}>
        {/* Scroll in hand */}
        <div style={{ position: 'absolute', bottom: 10, right: -4, width: 8, height: 18, background: '#F4D48A', borderRadius: 4, border: '1.5px solid #2E222F' }}>
          <div style={{ position: 'absolute', top: 3, left: 1, right: 1, height: 1.5, background: '#A87D1A', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 6, left: 1, right: 1, height: 1.5, background: '#A87D1A', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 9, left: 1, right: 1, height: 1.5, background: '#A87D1A', borderRadius: 1 }} />
        </div>
      </div>
      {/* Head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 38, height: 36,
        background: 'linear-gradient(160deg,#9CEBE0,#2BA898)',
        borderRadius: '50% 50% 44% 44% / 56% 56% 44% 44%',
        border: '2px solid #2E222F',
      }}>
        {/* Spectacles */}
        <div style={{ position: 'absolute', top: 11, left: 2, display: 'flex', gap: 1 }}>
          <div style={{ width: 11, height: 9, borderRadius: '50%', border: '2px solid #1A6B62', background: 'rgba(200,240,235,0.3)' }} />
          <div style={{ width: 11, height: 9, borderRadius: '50%', border: '2px solid #1A6B62', background: 'rgba(200,240,235,0.3)' }} />
        </div>
        {/* Quill behind ear */}
        <div style={{ position: 'absolute', top: 2, right: 3, width: 3, height: 14, background: '#F4D48A', borderRadius: '2px 2px 0 0', transform: 'rotate(15deg)' }} />
        {/* Mouth */}
        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 5, borderBottom: '2.5px solid #1A6B62', borderRadius: '0 0 50% 50%' }} />
      </div>
    </AvatarShell>
  )
}

/* ── Forge — builder: orange, gear on chest, hammer ── */
function AvatarForge({ glow }: { glow: boolean }) {
  return (
    <AvatarShell size={74}>
      {/* Body with overalls */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 54, height: 46,
        background: 'linear-gradient(180deg,#F2A07A,#C85F3F)',
        borderRadius: '6px 6px 20px 20px',
        boxShadow: glow ? '0 0 18px #F2A07A88' : undefined,
      }}>
        {/* Gear on chest */}
        <div style={{
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
          width: 18, height: 18,
          borderRadius: '50%',
          border: '3px solid #1A7468',
          background: '#2FB3A3',
          boxShadow: '0 0 4px #1A746888',
        }}>
          <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: '#1A7468' }} />
        </div>
        {/* Hammer handle */}
        <div style={{
          position: 'absolute', bottom: 8, right: -8,
          width: 5, height: 26, background: '#8B5E3C',
          borderRadius: 2, border: '1.5px solid #2E222F',
          transform: 'rotate(-20deg)',
        }}>
          {/* Hammer head */}
          <div style={{ position: 'absolute', top: 0, left: -4, width: 13, height: 8, background: '#8F828F', borderRadius: 2, border: '1.5px solid #2E222F' }} />
        </div>
      </div>
      {/* Head */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 42, height: 40,
        background: 'linear-gradient(160deg,#FAB88A,#D87050)',
        borderRadius: '50% 50% 44% 44% / 56% 56% 44% 44%',
        border: '2px solid #2E222F',
      }}>
        {/* Hard hat */}
        <div style={{ position: 'absolute', top: -6, left: -2, right: -2, height: 12, background: '#E8C86D', borderRadius: '50% 50% 0 0', border: '2px solid #2E222F', borderBottom: 'none' }} />
        {/* Eyes */}
        <div style={{ position: 'absolute', top: 16, left: 8, width: 7, height: 7, borderRadius: '50%', background: '#2E222F' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, borderRadius: '50%', background: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', top: 16, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#2E222F' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, borderRadius: '50%', background: '#fff' }} />
        </div>
        {/* Smirk */}
        <div style={{ position: 'absolute', bottom: 7, left: 12, width: 18, height: 5, borderBottom: '3px solid #A83820', borderRight: '3px solid #A83820', borderRadius: '0 0 50% 0' }} />
      </div>
    </AvatarShell>
  )
}

const AVATAR_MAP: Record<string, (props: { glow: boolean }) => JSX.Element> = {
  atlas: AvatarAtlas,
  pixel: AvatarPixel,
  probe: AvatarProbe,
  sentinel: AvatarSentinel,
  scribe: AvatarScribe,
  forge: AvatarForge,
}

/* ─────────────────────────────────────────────────────────
   XP BAR  (reads from gamification store)
───────────────────────────────────────────────────────── */
function XpBar({ agentKey }: { agentKey: string }) {
  const stats = useAgentStats(agentKey)
  const pct = stats.xpToNext > 0 ? Math.round((stats.xp / stats.xpToNext) * 100) : 100

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Level badge */}
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'linear-gradient(135deg,#E8C86D,#A87D1A)',
          border: '1.5px solid #2E222F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color: '#2E222F',
          boxShadow: '0 0 6px #E8C86D88',
        }}>
          {stats.level}
        </div>
        <span style={{ fontSize: 9, color: 'rgba(240,222,196,0.6)', fontFamily: 'monospace' }}>
          {stats.xp}/{stats.xpToNext} XP
        </span>
      </div>
      {/* Track */}
      <div style={{
        width: '100%', height: 5, borderRadius: 3,
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg,#2FB3A3,#4DE8D8)',
          borderRadius: 3,
          transition: 'width 0.6s ease',
          boxShadow: '0 0 6px #2FB3A3AA',
        }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   STATUS BUBBLE / CHIP
───────────────────────────────────────────────────────── */
function StatusBubble({ agent }: { agent: AgentDef }) {
  const base: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 600,
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(6px)',
  }

  if (agent.state === 'sleeping') {
    return (
      <div style={{ ...base, background: 'rgba(30,22,31,0.55)', border: '1px solid rgba(240,222,196,0.15)', color: 'rgba(240,222,196,0.5)' }}>
        <span style={{ fontSize: 10 }}>💤</span>
        Endormi
      </div>
    )
  }
  if (agent.state === 'permission') {
    return (
      <div style={{ ...base, background: 'rgba(255,248,236,0.92)', border: '1px solid #F3DFB4', color: '#A9791C' }}>
        <IconHelpCircle size={12} />
        Permission requise
      </div>
    )
  }
  if (agent.state === 'blocked') {
    return (
      <div style={{ ...base, background: 'rgba(184,59,48,0.15)', border: '1px solid rgba(242,201,196,0.6)', color: '#F2C9C4' }}>
        <IconAlert size={12} stroke={2.4} />
        {agent.task.slice(0, 22)}
      </div>
    )
  }
  // working
  return (
    <div style={{ ...base, background: 'rgba(47,179,163,0.18)', border: '1px solid rgba(47,179,163,0.45)', color: '#A0EEE6' }}>
      <IconActivity size={12} color="#2FB3A3" />
      {agent.taskFile
        ? <><span style={{ opacity: 0.7 }}>edit </span><span style={{ fontFamily: 'monospace' }}>{agent.taskFile}</span></>
        : <span>{agent.task.slice(0, 22)}</span>
      }
      {/* Typing dots */}
      <span style={{ display: 'inline-flex', gap: 2, marginLeft: 2 }}>
        {[0, 0.25, 0.5].map((d) => (
          <span key={d} style={{ width: 3, height: 3, borderRadius: '50%', background: '#2FB3A3', animation: `dot 1.2s infinite ${d}s` }} />
        ))}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   FLOATING CODE TOKENS (working state)
───────────────────────────────────────────────────────── */
const CODE_TOKENS: Record<string, string[]> = {
  atlas:    ['plan()', 'delegate()', 'v2.md'],
  pixel:    ['<Nav/>', 'css()', 'render'],
  probe:    ['assert()', 'fail!', 'jest'],
  sentinel: ['audit()', 'CVE?', 'scan'],
  scribe:   ['README', 'doc()', 'md'],
  forge:    ['git push', 'CI', 'deploy'],
}

/* ─────────────────────────────────────────────────────────
   STATE GLOW COLOR
───────────────────────────────────────────────────────── */
function stateGlowColor(state: string): string {
  if (state === 'working')    return 'rgba(47,179,163,0.55)'
  if (state === 'permission') return 'rgba(242,178,60,0.55)'
  if (state === 'blocked')    return 'rgba(183,59,48,0.55)'
  return 'transparent'
}

function stateRingColor(state: string): string {
  if (state === 'working')    return 'rgba(47,179,163,0.8)'
  if (state === 'permission') return 'rgba(242,178,60,0.8)'
  if (state === 'blocked')    return 'rgba(183,59,48,0.8)'
  return 'transparent'
}

/* ─────────────────────────────────────────────────────────
   SPRITE  (drag-and-drop in Construction mode)
───────────────────────────────────────────────────────── */
function Sprite({
  agent,
  left, top, z,
  construction,
  onMove, onOpen,
  label,
  children,
}: {
  agent: AgentDef
  left: string; top: string; z: number
  construction: boolean
  onMove: (k: string, l: string, t: string) => void
  onOpen: () => void
  label: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false })
  const [hovered, setHovered] = useState(false)

  const isWorking    = agent.state === 'working'
  const isPermission = agent.state === 'permission'
  const isSleeping   = agent.state === 'sleeping'

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
    onMove(agent.key, `${lx.toFixed(1)}%`, `${ty.toFixed(1)}%`)
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); drag.current.moved = false }}
      style={{
        position: 'absolute', left, top,
        transform: hovered && !construction
          ? 'translateX(-50%) scale(1.13)'
          : 'translateX(-50%) scale(1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        zIndex: hovered ? 200 : z,
        cursor: construction ? 'grab' : 'pointer',
        touchAction: construction ? 'none' : undefined,
        transition: drag.current.active
          ? 'none'
          : 'left 3.5s cubic-bezier(0.25,0.8,0.25,1), top 3.5s cubic-bezier(0.25,0.8,0.25,1), transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        outline: construction ? '1.5px dashed rgba(47,179,163,.6)' : undefined,
        outlineOffset: construction ? 8 : undefined,
      } as CSSProperties}
    >
      {/* Hover card with vitals + quick actions */}
      {hovered && !construction && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 186,
            background: 'rgba(24,16,26,0.96)',
            border: '1.5px solid rgba(47,179,163,0.5)',
            borderRadius: 14,
            padding: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(47,179,163,0.1)',
            zIndex: 1000,
            fontSize: 11,
            color: '#F0DEC4',
            animation: 'popIn 0.18s cubic-bezier(0.16,1,0.3,1)',
            cursor: 'default',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{agent.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(47,179,163,0.2)', color: '#2FB3A3',
              textTransform: 'uppercase',
            }}>{agent.role}</span>
          </div>
          {/* Vitals grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginBottom: 10 }}>
            <span style={{ color: 'rgba(240,222,196,0.5)' }}>Energie</span>
            <span style={{ fontWeight: 700, color: isSleeping ? '#5FA882' : '#DE7E43', textAlign: 'right' }}>
              {isSleeping ? '98%' : isWorking ? '72%' : '85%'}
            </span>
            <span style={{ color: 'rgba(240,222,196,0.5)' }}>Focus</span>
            <span style={{ fontWeight: 700, color: isWorking ? '#2FB3A3' : '#8F828F', textAlign: 'right' }}>
              {isWorking ? '95%' : '20%'}
            </span>
            <span style={{ color: 'rgba(240,222,196,0.5)' }}>Humeur</span>
            <span style={{ fontWeight: 700, textAlign: 'right' }}>
              {isWorking ? 'Focus' : isSleeping ? 'Calme' : 'Détendu'}
            </span>
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateAgentState(agent.key, { state: 'working', task: 'Pause café express' })
                addLog(`[Interactif] ${agent.name} va prendre un café ☕`)
                onMove(agent.key, '86%', '74%')
                setTimeout(() => {
                  onMove(agent.key, DEFAULTS[agent.key]?.left || '50%', DEFAULTS[agent.key]?.top || '50%')
                  updateAgentState(agent.key, { state: 'sleeping', task: 'Regonflé(e) par le café' })
                }, 4000)
              }}
              style={{
                width: '100%', background: 'rgba(222,126,67,0.15)', border: '1px solid rgba(222,126,67,0.35)',
                borderRadius: 6, padding: '5px 8px', textAlign: 'left', cursor: 'pointer',
                fontSize: 10, fontWeight: 600, color: '#DE7E43', display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(222,126,67,0.28)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(222,126,67,0.15)' }}
            >☕ Pause Café</button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateAgentState(agent.key, { state: 'sleeping', task: 'Sieste sur le pouf' })
                addLog(`[Interactif] ${agent.name} part s'installer pour une sieste 💤`)
                onMove(agent.key, '15%', '75%')
              }}
              style={{
                width: '100%', background: 'rgba(143,173,212,0.12)', border: '1px solid rgba(143,173,212,0.3)',
                borderRadius: 6, padding: '5px 8px', textAlign: 'left', cursor: 'pointer',
                fontSize: 10, fontWeight: 600, color: '#8FADD4', display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(143,173,212,0.22)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(143,173,212,0.12)' }}
            >💤 Faire une Sieste</button>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   AGENT CARD  — the full visual unit per agent
───────────────────────────────────────────────────────── */
function AgentCard({ agent }: { agent: AgentDef }) {
  const AvatarComp = AVATAR_MAP[agent.key]
  const isWorking    = agent.state === 'working'
  const isPermission = agent.state === 'permission'
  const isSleeping   = agent.state === 'sleeping'

  const glowColor = stateGlowColor(agent.state)
  const ringColor = stateRingColor(agent.state)
  const tokens = CODE_TOKENS[agent.key] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Status bubble */}
      <StatusBubble agent={agent} />

      {/* Avatar wrapper with glow ring */}
      <div style={{ position: 'relative', marginTop: 2 }}>
        {/* Pulsing glow ring for working / permission */}
        {(isWorking || isPermission) && (
          <div style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `2px solid ${ringColor}`,
            animation: 'glowRing 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        {/* Secondary ring */}
        {isWorking && (
          <div style={{
            position: 'absolute',
            inset: -16,
            borderRadius: '50%',
            border: `1px solid ${ringColor}`,
            opacity: 0.35,
            animation: 'glowRing 2s ease-out infinite 0.4s',
            pointerEvents: 'none',
          }} />
        )}

        {/* Avatar glow halo */}
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background: `radial-gradient(closest-side, ${glowColor}, transparent)`,
          filter: 'blur(6px)',
          pointerEvents: 'none',
          animation: isWorking || isPermission ? 'haloBreath 2.5s ease-in-out infinite' : undefined,
        }} />

        {/* Sleeping — desaturate layer */}
        <div style={{ opacity: isSleeping ? 0.6 : 1, filter: isSleeping ? 'saturate(0.4)' : undefined, animation: isSleeping ? 'floatSlow 5s ease-in-out infinite' : isWorking ? 'floatFast 2.8s ease-in-out infinite' : 'floatMed 3.5s ease-in-out infinite' }}>
          {AvatarComp ? <AvatarComp glow={isWorking} /> : null}
        </div>

        {/* Working spinning gear overlay */}
        {isWorking && (
          <div style={{
            position: 'absolute',
            top: -10, right: -10,
            width: 18, height: 18,
            animation: 'spinGear 2s linear infinite',
            pointerEvents: 'none',
          }}>
            <svg viewBox="0 0 18 18" width="18" height="18">
              <path d="M9 1.5A7.5 7.5 0 1 1 1.5 9 7.5 7.5 0 0 1 9 1.5z" fill="none" stroke="#2FB3A3" strokeWidth="1.5"/>
              <path d="M7 3h4v2H7zM7 13h4v2H7zM1 7h2v4H1zM15 7h2v4h-2zM3.5 3.5l1.4 1.4-1.4 1.4L2.1 4.9zM13.1 13.1l1.4 1.4-1.4 1.4-1.4-1.4zM3.5 14.5l1.4-1.4 1.4 1.4-1.4 1.4zM13.1 4.9l1.4-1.4 1.4 1.4-1.4 1.4z" fill="#2FB3A3"/>
              <circle cx="9" cy="9" r="2" fill="#2FB3A3"/>
            </svg>
          </div>
        )}

        {/* Permission — pulsing question mark */}
        {isPermission && (
          <div style={{
            position: 'absolute',
            top: -10, right: -10,
            width: 20, height: 20,
            borderRadius: '50%',
            background: '#F3DFB4',
            border: '2px solid #A9791C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#A9791C',
            animation: 'pulse 1.4s ease-in-out infinite',
            pointerEvents: 'none',
          }}>?</div>
        )}

        {/* Blocked — X mark */}
        {agent.state === 'blocked' && (
          <div style={{
            position: 'absolute',
            top: -10, right: -10,
            width: 20, height: 20,
            borderRadius: '50%',
            background: '#B83B30',
            border: '2px solid #F2C9C4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
            pointerEvents: 'none',
          }}>✕</div>
        )}

        {/* Floating code tokens for working agent */}
        {isWorking && tokens.map((tok, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${30 + (i % 2 === 0 ? -35 : 35)}px`,
              top: `${10 + i * 20}px`,
              fontSize: 9,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: i % 2 === 0 ? '#2FB3A3' : '#E8C86D',
              opacity: 0,
              animation: `floatCode 2.4s ease-out infinite ${i * 0.7}s`,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >{tok}</div>
        ))}

        {/* Sleeping Zzz */}
        {isSleeping && (
          <div style={{ position: 'absolute', top: -8, right: -4, pointerEvents: 'none' }}>
            {['z', 'z', 'Z'].map((c, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  right: i * 8,
                  top: -i * 6,
                  fontSize: 10 + i * 3,
                  fontWeight: 800,
                  color: 'rgba(143,130,143,0.7)',
                  animation: `floatZzz 3s ease-in-out infinite ${i * 0.9}s`,
                }}
              >{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Name + role chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 999,
        fontSize: 10.5, fontWeight: 700,
        background: 'rgba(24,16,26,0.75)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(4px)',
        color: '#F0DEC4',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATE_CHIP[agent.state].dot, flexShrink: 0, animation: STATE_CHIP[agent.state].pulse ? 'dotPulse 1.8s ease-out infinite' : undefined }} />
        {agent.name}
        <span style={{ opacity: 0.45 }}>·</span>
        <span style={{ opacity: 0.6, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{agent.role}</span>
      </div>

      {/* XP bar */}
      <XpBar agentKey={agent.key} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   TECH PANEL DECOR (corners)
───────────────────────────────────────────────────────── */
function CornerPanel({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isTop  = corner === 'tl' || corner === 'tr'
  const isLeft = corner === 'tl' || corner === 'bl'
  return (
    <div style={{
      position: 'absolute',
      top:    isTop  ? 10 : undefined,
      bottom: !isTop ? 86 : undefined,
      left:   isLeft ? 10 : undefined,
      right:  !isLeft ? 10 : undefined,
      width: 56, height: 56,
      pointerEvents: 'none',
    }}>
      {/* L-bracket */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        border: '2px solid rgba(47,179,163,0.4)',
        borderRight: 'none', borderBottom: 'none',
        borderRadius: '4px 0 0 0',
        transform: `rotate(${corner === 'tr' ? 90 : corner === 'br' ? 180 : corner === 'bl' ? 270 : 0}deg)`,
        transformOrigin: '50% 50%',
      }} />
      {/* Dot grid */}
      <div style={{
        position: 'absolute',
        top: 6, left: 6, right: 6, bottom: 6,
        backgroundImage: 'radial-gradient(circle, rgba(47,179,163,0.4) 1px, transparent 1px)',
        backgroundSize: '8px 8px',
      }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SIDE PANEL — left/right decorative data displays
───────────────────────────────────────────────────────── */
function SidePanel({ side, agentKeys, dynamicStates }: {
  side: 'left' | 'right'
  agentKeys: string[]
  dynamicStates: Record<string, { state: string }>
}) {
  const workingCount  = agentKeys.filter((k) => (dynamicStates[k]?.state || 'sleeping') === 'working').length
  const sleepingCount = agentKeys.filter((k) => (dynamicStates[k]?.state || 'sleeping') === 'sleeping').length
  const blockedCount  = agentKeys.filter((k) => (dynamicStates[k]?.state || 'sleeping') === 'blocked').length

  return (
    <div style={{
      position: 'absolute',
      top: '12%',
      [side]: 6,
      width: 64,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      zIndex: 2,
    }}>
      {/* Mini stat blocks */}
      {[
        { label: 'ACTIFS', value: workingCount,  color: '#2FB3A3' },
        { label: 'SLEEP',  value: sleepingCount, color: '#8F828F' },
        { label: 'BLOCK',  value: blockedCount,  color: '#B83B30' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          background: 'rgba(14,10,16,0.65)',
          border: `1px solid ${color}44`,
          borderRadius: 6,
          padding: '5px 6px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 7, color: 'rgba(240,222,196,0.4)', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
        </div>
      ))}
      {/* Vertical scan line */}
      <div style={{
        width: 2, height: 40, borderRadius: 1,
        background: `linear-gradient(180deg, transparent, rgba(47,179,163,0.6), transparent)`,
        margin: '4px auto',
        animation: 'scanLine 2.5s ease-in-out infinite',
      }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SCENE MAIN
───────────────────────────────────────────────────────── */
export default function Scene({
  showGrid,
  onOpenAgent,
}: { showGrid: boolean; onOpenAgent: (key: string) => void }) {
  const dynamicStates = useAllAgentsRuntimeStates()
  const activityLogs  = useActivityLogs()

  const [pos, setPos] = useState(() => {
    const base = { ...DEFAULTS }
    for (const key of Object.keys(AGENTS)) {
      if (!base[key]) base[key] = { left: '50%', top: '50%' }
    }
    return base
  })

  const onMove = (key: string, left: string, top: string) =>
    setPos((p) => ({ ...p, [key]: { left, top } }))

  // Re-sync positions for working agents to their default seats
  useEffect(() => {
    setPos((cur) => {
      let changed = false
      const next = { ...cur }
      for (const [key, dyn] of Object.entries(dynamicStates)) {
        if (dyn.state === 'working') {
          const def = DEFAULTS[key]
          if (def && (next[key].left !== def.left || next[key].top !== def.top)) {
            next[key] = def
            changed = true
          }
        }
      }
      return changed ? next : cur
    })
  }, [dynamicStates])

  // Autonomous wandering for idle agents
  useEffect(() => {
    const id = setInterval(() => {
      const idleKeys = Object.keys(AGENTS).filter(
        (k) => !dynamicStates[k] || dynamicStates[k].state !== 'working',
      )
      if (!idleKeys.length) return

      const key  = idleKeys[Math.floor(Math.random() * idleKeys.length)]
      const name = AGENTS[key].name
      const targets = [
        { label: 'au canapé',          left: '14%', top: '74%' },
        { label: 'près de la fenêtre', left: '47%', top: '38%' },
        { label: 'à la cafetière',     left: '85%', top: '72%' },
        { label: 'à son poste',        ...DEFAULTS[key] ?? { left: '50%', top: '50%' } },
      ]
      const chosen = targets[Math.floor(Math.random() * targets.length)]
      setPos((p) => ({ ...p, [key]: { left: chosen.left, top: chosen.top } }))
      addLog(`[${name}] se déplace ${chosen.label}.`)
    }, 16000)
    return () => clearInterval(id)
  }, [dynamicStates])

  const agentKeys = useMemo(() => Object.keys(AGENTS), [])

  return (
    <section style={{
      flex: 1, position: 'relative', borderRadius: 18, overflow: 'hidden',
      border: '1px solid rgba(47,179,163,0.25)',
      background: `
        radial-gradient(ellipse 80% 60% at 50% 0%, #0D2535 0%, transparent 70%),
        radial-gradient(ellipse 100% 80% at 20% 100%, #0B1A24 0%, transparent 60%),
        linear-gradient(170deg, #081520 0%, #0E2030 30%, #122838 60%, #0A1C2A 100%)
      `,
      boxShadow: '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(47,179,163,0.15)',
      minHeight: 500,
    }}>
      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes popIn {
          from { transform: translateX(-50%) scale(0.88) translateY(6px); opacity: 0; }
          to   { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
        }
        @keyframes floatFast {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes floatMed {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes floatSlow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes floatZzz {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: translateY(-18px) scale(1.1); opacity: 0; }
        }
        @keyframes floatCode {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 0.9; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes glowRing {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes haloBreath {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes spinGear {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50% { box-shadow: 0 0 0 4px transparent; }
        }
        @keyframes dot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.6; }
          100% { transform: translateY(-40px) translateX(10px) scale(0.7); opacity: 0; }
        }
        @keyframes scanLine {
          0%,100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to   { background-position: 0 48px; }
        }
        @keyframes halo {
          0%,100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes termBlink {
          0%,100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* ── BACKGROUND LAYERS ── */}

      {/* Grid overlay — scrolling tech panel feel */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          repeating-linear-gradient(0deg,   rgba(47,179,163,0.06) 0 1px, transparent 1px 48px),
          repeating-linear-gradient(90deg,  rgba(47,179,163,0.06) 0 1px, transparent 1px 48px)
        `,
        animation: 'gridScroll 12s linear infinite',
      }} />

      {/* Radial center bloom */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(47,179,163,0.07), transparent 70%)',
      }} />

      {/* Top scanline vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.45) 100%)',
      }} />

      {/* Construction mode teal grid */}
      {showGrid && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(0deg,  rgba(47,179,163,0.25) 0 1.5px, transparent 1.5px 48px),
            repeating-linear-gradient(90deg, rgba(47,179,163,0.25) 0 1.5px, transparent 1.5px 48px)
          `,
        }} />
      )}

      {/* ── PARTICLES ── */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `particleDrift ${p.dur}s ease-in-out infinite ${p.delay}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── CORNER PANELS ── */}
      <CornerPanel corner="tl" />
      <CornerPanel corner="tr" />
      <CornerPanel corner="bl" />
      <CornerPanel corner="br" />

      {/* ── SIDE PANELS ── */}
      <SidePanel side="left"  agentKeys={agentKeys} dynamicStates={dynamicStates} />
      <SidePanel side="right" agentKeys={agentKeys} dynamicStates={dynamicStates} />

      {/* ── CONSTRUCTION MODE BANNER ── */}
      {showGrid && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(14,10,16,0.88)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(47,179,163,0.5)', borderRadius: 999,
          padding: '7px 8px 7px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#2FB3A3' }}>
            Mode Construction — glisse un agent pour le placer
          </span>
          <a
            href="#/creer-agent"
            className="btn btn-primary"
            style={{ textDecoration: 'none', padding: '6px 13px', fontSize: 12 }}
          >
            <IconPlus size={13} />Recruter
          </a>
        </div>
      )}

      {/* ── AGENT SPRITES ── */}
      {Object.values(AGENTS).map((staticAgent) => {
        const dyn   = dynamicStates[staticAgent.key] ?? staticAgent
        const agent = { ...staticAgent, ...dyn } as AgentDef

        const p = pos[agent.key] ?? { left: '50%', top: '50%' }
        const z = AGENT_Z[agent.key] ?? 4

        return (
          <Sprite
            key={agent.key}
            agent={agent}
            left={p.left}
            top={p.top}
            z={z}
            construction={showGrid}
            onMove={onMove}
            onOpen={() => onOpenAgent(agent.key)}
            label={`Ouvrir la fiche de ${agent.name}`}
          >
            <AgentCard agent={agent} />
          </Sprite>
        )
      })}

      {/* ── ACTIVITY CONSOLE ── */}
      <div style={{
        position: 'absolute',
        bottom: 10, left: 10, right: 10,
        height: 78,
        background: 'rgba(8,14,22,0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(47,179,163,0.2)',
        borderRadius: 10,
        padding: '7px 14px',
        fontFamily: 'monospace',
        fontSize: 10.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        overflowY: 'auto',
        zIndex: 10,
        boxShadow: 'inset 0 0 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(47,179,163,0.08)',
      }}>
        {/* Console header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(47,179,163,0.12)',
          paddingBottom: 4, marginBottom: 3,
        }}>
          <span style={{ color: '#2FB3A3', fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' }}>
            ROOST COMMAND CONSOLE
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2FB3A3', display: 'inline-block', animation: 'halo 2s infinite' }} />
            <span style={{ fontSize: 8.5, color: 'rgba(47,179,163,0.7)' }}>LIVE</span>
          </div>
        </div>
        {/* Log lines */}
        {activityLogs.slice(0, 3).map((log) => (
          <div key={log.id} style={{ display: 'flex', gap: 8, lineHeight: 1.4 }}>
            <span style={{ color: 'rgba(47,179,163,0.4)', flexShrink: 0 }}>[{log.time}]</span>
            <span style={{
              color: log.text.includes('café') ? '#DE7E43'
                   : log.text.includes('sieste') || log.text.includes('somnoler') ? '#8FADD4'
                   : log.text.includes('ERREUR') || log.text.includes('bloqué') ? '#F2C9C4'
                   : 'rgba(240,222,196,0.8)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{log.text}</span>
          </div>
        ))}
        {/* Blinking cursor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <span style={{ color: '#2FB3A3', opacity: 0.5 }}>&gt;</span>
          <span style={{ width: 6, height: 11, background: '#2FB3A3', opacity: 0.7, animation: 'termBlink 1.1s step-end infinite' }} />
        </div>
      </div>
    </section>
  )
}
