import type { Metadata } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'Roost',
  description: "Pilotez toute votre équipe d'agents IA, sous un même toit.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
