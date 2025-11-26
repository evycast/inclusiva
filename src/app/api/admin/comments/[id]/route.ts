import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { commentModerateSchema, type CommentModerateInput } from '@/lib/validation/comment'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  const { id } = await params
  const body = await req.json()
  const parsed = commentModerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data as CommentModerateInput

  const updated = await prisma.comment.update({
    where: { id },
    data: { status: input.status },
  })

  await prisma.moderationLog.create({
    data: {
      actor: (auth.ok ? (auth as { ok: true; userId?: string }).userId : undefined) ?? 'admin',
      action: input.status === 'hidden' ? 'comment_hide' : 'comment_delete',
      targetType: 'comment',
      targetId: id,
      reason: input.reason ?? null,
    },
  })

  return NextResponse.json({ data: updated })
}
