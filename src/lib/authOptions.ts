import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        const email = (creds?.email ?? '').toString().trim().toLowerCase()
        const password = (creds?.password ?? '').toString()
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        if (user.status === 'rejected') return null
        const ok = await verifyPassword(password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; role: 'user' | 'moderator' | 'admin' }
        token.id = u.id
        token.role = u.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        const id = token.id as string | undefined
        const role = token.role as 'user' | 'moderator' | 'admin' | undefined
        if (id) session.user.id = id
        if (role) session.user.role = role
      }
      return session
    },
  },
}
