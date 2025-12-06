import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { adminUpdateUserSchema, type AdminUpdateUserInput } from '@/lib/validation/auth'
import type { ApiUser } from '@/types/api'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data: ApiUser = {
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
    }
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  try {
    const json = await req.json()
    const { id } = await context.params
    const input = adminUpdateUserSchema.parse({ ...json, id }) as AdminUpdateUserInput
    const updates: Record<string, unknown> = {}
    if (input.role) updates.role = input.role
    if (input.status) updates.status = input.status
    if (typeof input.verifiedPublic === 'boolean') updates.verifiedPublic = input.verifiedPublic
    if (typeof input.emailVerified === 'boolean') updates.emailVerified = input.emailVerified ? new Date() : null
    if (typeof input.name === 'string') updates.name = input.name
    if (typeof input.phone === 'string') updates.phone = input.phone
    if (typeof input.dni === 'string') updates.dni = input.dni

    const u = await prisma.user.update({ where: { id }, data: updates })

    const hasStatusChange = typeof input.status === 'string'
    const action = hasStatusChange ? `user_status_${input.status}` : 'user_update'
    const reason = typeof (json as { reason?: string }).reason === 'string' ? (json as { reason?: string }).reason : null
    await prisma.moderationLog.create({
      data: {
        actor: auth.userId ?? 'system',
        action,
        targetType: 'User',
        targetId: u.id,
        reason: hasStatusChange ? reason : null,
      },
    })

    const data: ApiUser = {
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      dni: u.dni,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
      verifiedPublic: u.verifiedPublic,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  try {
    const { id } = await context.params
    await prisma.post.deleteMany({ where: { authorId: id } })
    await prisma.user.delete({ where: { id } })
    await prisma.moderationLog.create({
      data: { actor: auth.userId ?? 'system', action: 'user_delete', targetType: 'User', targetId: id },
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
