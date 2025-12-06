import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({ where: { id }, include: { socials: true } })
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (post.status !== 'approved') {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    if (post.expiresAt && new Date(post.expiresAt) <= new Date()) {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
