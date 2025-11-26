import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export type UserRole = 'user' | 'moderator' | 'admin'

function base64url(input: Buffer | string): string {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}


function getToken(req: NextRequest): string | undefined {
  const cookie = req.cookies.get('adminToken')?.value
  if (cookie && cookie.length > 0) return cookie
  return undefined
}

function signJWT(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerPart = base64url(JSON.stringify(header))
  const payloadPart = base64url(JSON.stringify(payload))
  const data = `${headerPart}.${payloadPart}`
  const signature = createHmac('sha256', secret).update(data).digest()
  const signaturePart = base64url(signature)
  return `${data}.${signaturePart}`
}

function verifyJWT(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerPart, payloadPart, signaturePart] = parts
  const data = `${headerPart}.${payloadPart}`
  const expected = base64url(createHmac('sha256', secret).update(data).digest())
  if (expected !== signaturePart) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) return null
    }
    return payload
  } catch {
    return null
  }
}

export function signUserJWT(userId: string, role: UserRole, opts?: { expiresInSec?: number }): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('Missing ADMIN_TOKEN_SECRET')
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (opts?.expiresInSec ?? 2 * 60 * 60)
  return signJWT({ sub: userId, role, iat: now, exp }, secret)
}

function isAdminBearer(req: NextRequest): boolean {
  const token = getToken(req)
  if (!token) return false
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) return false
  const payload = verifyJWT(token, secret)
  const role = (payload as { role?: UserRole } | null)?.role
  return role === 'admin' || role === 'moderator'
}

export function isAdmin(req: NextRequest): boolean {
  const bearerOk = isAdminBearer(req)
  return bearerOk
}

export function requireAdmin(req: NextRequest): { ok: true; userId?: string; role?: 'admin' } | { ok: false; res: Response } {
  const token = getToken(req)
  const secret = process.env.NEXTAUTH_SECRET
  if (!token || !secret) {
    return {
      ok: false,
      res: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Cookie' },
      }),
    }
  }
  const payload = verifyJWT(token, secret)
  const role = (payload as { role?: UserRole } | null)?.role
  if (role !== 'admin') {
    return {
      ok: false,
      res: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Cookie' },
      }),
    }
  }
  const userId = (payload as { sub?: string } | null)?.sub
  return { ok: true, userId, role }
}

export async function requireRole(req: NextRequest, allowed: ReadonlyArray<UserRole>): Promise<{ ok: true; userId?: string; role: UserRole } | { ok: false; res: Response }> {
  const token = getToken(req)
  const secret = process.env.NEXTAUTH_SECRET
  if (token && secret) {
    const payload = verifyJWT(token, secret)
    const role = (payload as { role?: UserRole } | null)?.role
    if (role && allowed.includes(role)) {
      const userId = (payload as { sub?: string } | null)?.sub
      return { ok: true, userId, role }
    }
  }
  const session = await getServerSession(authOptions)
  const sRole = session?.user?.role as UserRole | undefined
  if (sRole && allowed.includes(sRole)) {
    return { ok: true, userId: session?.user?.id, role: sRole }
  }
  return {
    ok: false,
    res: new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Cookie' },
    }),
  }
}

export async function getSSRAuth(): Promise<{ ok: boolean; role?: UserRole; userId?: string }> {
  const secret = process.env.NEXTAUTH_SECRET
  const c = await cookies()
  const token = c.get('adminToken')?.value
  if (token && secret) {
    const payload = verifyJWT(token, secret)
    if (payload) {
      const role = (payload as { role?: UserRole }).role
      const userId = (payload as { sub?: string }).sub
      if (role) return { ok: true, role, userId }
    }
  }
  const session = await getServerSession(authOptions)
  const sRole = session?.user?.role as UserRole | undefined
  const sId = session?.user?.id
  if (sRole) return { ok: true, role: sRole, userId: sId }
  return { ok: false }
}

export async function requireSSRRole(allowed: ReadonlyArray<UserRole>): Promise<{ ok: true; role: UserRole; userId?: string } | { ok: false }> {
  const auth = await getSSRAuth()
  if (!auth.ok || !auth.role) return { ok: false }
  if (!allowed.includes(auth.role)) return { ok: false }
  return { ok: true, role: auth.role, userId: auth.userId }
}

export async function getRoleFromRequest(req: NextRequest): Promise<UserRole | undefined> {
  const token = getToken(req)
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (token && secret) {
    const payload = verifyJWT(token, secret)
    const role = (payload as { role?: UserRole } | null)?.role
    if (role) return role
  }
  const session = await getServerSession(authOptions)
  return session?.user?.role as UserRole | undefined
}
