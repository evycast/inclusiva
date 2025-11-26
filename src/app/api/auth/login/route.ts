import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { signUserJWT } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email: (email ?? '').toLowerCase() } })
    if (!user) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    const ok = await verifyPassword(String(password ?? ''), user.passwordHash)
    if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    const expiresInSec = 2 * 60 * 60
    const token = signUserJWT(user.id, user.role, { expiresInSec })
    const res = NextResponse.json({ token, user: { id: user.id, email: user.email, role: user.role } })
    res.cookies.set('adminToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresInSec,
      path: '/',
    })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
