import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@roost/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name, provider } = req.body

  if (!email || !provider) {
    return res.status(400).json({ error: 'E-mail et provider requis' })
  }

  try {
    const cleanEmail = email.toLowerCase().trim()
    const password = `social-pass-${provider}`

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10)
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          passwordHash,
        }
      })
    }

    return res.status(200).json({ ok: true, userId: user.id })
  } catch (err: any) {
    console.error('Social signin database error:', err)
    return res.status(500).json({ error: 'Erreur de base de données' })
  }
}
