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
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    if (req.method === 'GET') {
      const convos = await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      })
      // Map to frontend interface StoredConversation
      const mapped = convos.map(c => ({
        id: c.id,
        agentKey: c.agentKey,
        title: c.title,
        messages: typeof c.messages === 'string' ? JSON.parse(c.messages) : c.messages,
        updatedAt: c.updatedAt.getTime()
      }))
      return res.status(200).json({ conversations: mapped })
    }

    if (req.method === 'POST') {
      const { id, agentKey, title, messages } = req.body

      if (!id || !agentKey || !title || !messages) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' })
      }

      // Upsert conversation
      const convo = await prisma.conversation.upsert({
        where: { id },
        update: {
          title,
          messages,
          updatedAt: new Date()
        },
        create: {
          id,
          userId: user.id,
          agentKey,
          title,
          messages
        }
      })

      return res.status(200).json({ ok: true, conversation: convo })
    }

    return res.status(405).json({ error: 'Méthode non autorisée' })
  } catch (err: any) {
    console.error('API conversations error:', err)
    return res.status(500).json({ error: 'Erreur serveur de base de données' })
  }
}
