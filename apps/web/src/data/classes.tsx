import type { ReactNode } from 'react'
import type { Face } from '../components/AgentBody'

export interface AgentClass {
  key: string
  label: string
  tool: string
  from: string
  to: string
  face: Face
  /** accessoire de ventre, repère 140×175 (cx70 cy118) */
  accessory: ReactNode
}

export const CLASSES: AgentClass[] = [
  {
    key: 'frontend', label: 'Frontend', tool: 'pinceau', from: '#F4889E', to: '#D9476A', face: 'happy',
    accessory: (
      <g stroke="#C23E55" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M63 122l9-9 3 3-9 9z" /><path d="M72 113l2-2 3 3-2 2" />
      </g>
    ),
  },
  {
    key: 'backend', label: 'Backend', tool: 'engrenage', from: '#7BD5C8', to: '#1E8C7F', face: 'happy',
    accessory: (
      <g stroke="#1A7468" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="70" cy="118" r="4.5" />
        <path d="M70 109v-3M70 130v-3M79 118h3M58 118h3M76.5 111.5l2 2M61.5 124.5l2 2M76.5 124.5l2-2M61.5 111.5l2-2" />
      </g>
    ),
  },
  {
    key: 'tests', label: 'Tests', tool: 'loupe', from: '#F7C463', to: '#D98A18', face: 'happy',
    accessory: (
      <g stroke="#A9791C" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="67" cy="115" r="6" /><path d="m72 120 4 4" />
      </g>
    ),
  },
  {
    key: 'recherche', label: 'Recherche', tool: 'livre', from: '#7FC0E3', to: '#3CA7D6', face: 'happy',
    accessory: (
      <g stroke="#2575A0" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M63 112h14v12H63z" /><path d="M70 112v12" />
      </g>
    ),
  },
  {
    key: 'devops', label: 'DevOps', tool: 'clé', from: '#F2A07A', to: '#C85F3F', face: 'happy',
    accessory: (
      <g stroke="#A14C2C" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M75 110a4 4 0 0 1-5 5l-7 7 3 3 7-7a4 4 0 0 1 5-5l-2 2-3-3z" />
      </g>
    ),
  },
  {
    key: 'docs', label: 'Docs', tool: 'plume', from: '#A99BE8', to: '#7E6BD9', face: 'happy',
    accessory: (
      <g stroke="#5B49B5" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M77 112c-11 2-17 11-16 20" /><path d="M61.5 126c3-5 8-8 14-9" />
      </g>
    ),
  },
  {
    key: 'refacto', label: 'Refacto', tool: 'étincelles', from: '#86C7A4', to: '#5FA882', face: 'happy',
    accessory: (
      <g fill="#3C7E5C">
        <path d="M68 110l1.6 4.6 4.6 1.6-4.6 1.6L68 122.4l-1.6-4.6L61.8 116.2l4.6-1.6z" />
        <path d="M77 120l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" />
      </g>
    ),
  },
]
