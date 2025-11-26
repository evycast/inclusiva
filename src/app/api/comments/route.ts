import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { commentCreateSchema, type CommentCreateInput } from '@/lib/validation/comment'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 })

  const comments = await prisma.comment.findMany({
    where: { postId, status: 'visible' },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ data: comments })
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const input = commentCreateSchema.parse(json) as CommentCreateInput

    // Rate limit: máx 3 comentarios por 5 minutos por guestName+post
    const windowMs = 5 * 60 * 1000
    const since = new Date(Date.now() - windowMs)
    const keyName = input.guestName ?? ''
    if (keyName) {
      const recent = await prisma.comment.count({
        where: { postId: input.postId, guestName: keyName, createdAt: { gt: since } },
      })
      if (recent >= 3) {
        return NextResponse.json({ error: 'Demasiados comentarios, intentá más tarde' }, { status: 429 })
      }
    }

    const created = await prisma.comment.create({
      data: {
        postId: input.postId,
        content: input.content.trim(),
        guestName: input.guestName?.trim() ?? null,
        parentId: input.parentId ?? null,
        status: 'visible',
      },
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
