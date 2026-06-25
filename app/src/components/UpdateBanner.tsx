import { useEffect, useState } from 'react'

interface UpdateInfo {
  version: string
  url: string
  notes?: string
}

export default function UpdateBanner() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // uniquement en Electron
    window.roostBridge?.onUpdateAvailable((info) => setUpdate(info))
  }, [])

  if (!update || dismissed || !window.roostBridge) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderRadius: 14,
        background: 'linear-gradient(135deg,#2FB3A3,#1E9B8A)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 28px rgba(47,179,163,.45)',
        animation: 'slidein .3s cubic-bezier(.2,.8,.2,1)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.9, flex: 'none' }} />
      Roost {update.version} disponible
      <button
        onClick={() => window.roostBridge!.openExternal(update.url)}
        style={{
          marginLeft: 4,
          padding: '5px 12px',
          border: 'none',
          borderRadius: 8,
          background: 'rgba(255,255,255,.22)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Télécharger
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        style={{
          marginLeft: 2,
          width: 24,
          height: 24,
          border: 'none',
          borderRadius: 6,
          background: 'rgba(255,255,255,.15)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
