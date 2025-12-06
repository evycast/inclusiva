import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminCreateUserSchema, type AdminCreateUserInput } from '@/lib/validation/auth'
import { hashPassword } from '@/lib/password'
import { requireRole } from '@/lib/auth'
import type { ApiUser, UsersListResponse } from '@/types/api'

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
        phone: input.phone ?? null,
        dni: input.dni ?? null,
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

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(parseInt(sp.get('page') ?? '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') ?? '24', 10) || 24, 1), 100)
    const q = sp.get('q') ?? undefined
    const role = sp.get('role') as ('user' | 'moderator' | 'admin') | undefined
    const status = sp.get('status') as ('pending' | 'approved' | 'rejected') | undefined
    const verifiedPublic = sp.get('verifiedPublic')
    const emailVerified = sp.get('emailVerified')

    const where = {
      AND: [
        q
          ? {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { name: q ? { contains: q, mode: 'insensitive' } : undefined },
              ].filter(Boolean) as Array<unknown>,
            }
          : undefined,
        role ? { role } : undefined,
        status ? { status } : undefined,
        verifiedPublic === 'true' ? { verifiedPublic: true } : verifiedPublic === 'false' ? { verifiedPublic: false } : undefined,
        emailVerified === 'true' ? { emailVerified: { not: null } } : emailVerified === 'false' ? { emailVerified: null } : undefined,
      ].filter(Boolean) as Array<unknown>,
    } as { AND?: Array<Record<string, unknown>> }

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    const totalPages = Math.ceil(total / pageSize) || 1

    const data: ApiUser[] = rows.map((u) => ({
      id: u.id,
      email: u.email,
      avatar: u.avatar ?? null,
      name: u.name,
      phone: u.phone,
      dni: u.dni,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
      verifiedPublic: u.verifiedPublic,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }))

    const res: UsersListResponse = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
    return NextResponse.json(res)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
