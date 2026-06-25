import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@roost/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail et mot de passe requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum' })
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existing) {
      return res.status(400).json({ error: 'Un compte existe déjà avec cet email' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || email.split('@')[0],
        email: email.toLowerCase().trim(),
        passwordHash
      }
    })

    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err: any) {
    console.error('Registration error:', err)
    return res.status(500).json({ error: 'Erreur serveur lors de la création du compte' })
  }
}
