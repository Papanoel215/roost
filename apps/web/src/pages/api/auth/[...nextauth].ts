import NextAuth, { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@roost/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail et mot de passe requis')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        })

        if (!user || !user.passwordHash) {
          throw new Error('Aucun compte trouvé avec cet e-mail')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('Mot de passe incorrect')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  }
}

export default NextAuth(authOptions)
