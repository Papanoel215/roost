import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '@roost/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const email = session.user.email

  try {
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { settings: true }
      })
      return res.status(200).json({ settings: user?.settings || {} })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { settings } = req.body
      const user = await prisma.user.update({
        where: { email },
        data: { settings }
      })
      return res.status(200).json({ ok: true, settings: user.settings })
    }

    return res.status(405).json({ error: 'Méthode non autorisée' })
  } catch (err: any) {
    console.error('API profile error:', err)
    return res.status(500).json({ error: 'Erreur serveur de base de données' })
  }
}
