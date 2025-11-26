import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminCreateUserSchema, type AdminCreateUserInput } from '@/lib/validation/auth'
import { hashPassword } from '@/lib/password'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  try {
    const json = await req.json()
    const input = adminCreateUserSchema.parse(json) as AdminCreateUserInput
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    const passwordHash = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name ?? null,
        role: input.role,
        status: input.status ?? 'approved',
        verifiedPublic: input.verifiedPublic ?? false,
        emailVerified: input.emailVerified ? new Date() : null,
      },
    })
    return NextResponse.json({ data: { id: user.id, email: user.email, role: user.role } }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
