import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'
import type { ApiPost } from '@/types/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        _count: { select: { socials: true } },
        user: { select: { name: true, avatar: true, verifiedPublic: true } },
      },
    })
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (post.status !== 'approved') {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!post.authorId && post.authorId === auth.userId
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    if (post.expiresAt && new Date(post.expiresAt) <= new Date()) {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!post.authorId && post.authorId === auth.userId
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    const hasContact = typeof post._count?.socials === 'number' ? post._count.socials > 0 : false

    const base = {
      id: post.id,
      authorId: post.authorId ?? undefined,
      title: post.title,
      subtitle: post.subtitle ?? undefined,
      description: post.description,
      image: post.image,
      // Datos del autor desde la relación User
      authorName: post.user?.name ?? undefined,
      authorAvatar: post.user?.avatar ?? undefined,
      authorVerified: !!post.user?.verifiedPublic,
      price: post.price ?? undefined,
      rating: typeof post.rating === 'number' ? post.rating : undefined,
      ratingCount: typeof post.ratingCount === 'number' ? post.ratingCount : undefined,
      tags: Array.isArray(post.tags) ? (post.tags as ApiPost['tags']) : undefined,
      urgent: !!post.urgent,
      date: post.date ? new Date(post.date).toISOString() : undefined,
      status: post.status,
      socials: [] as ApiPost['socials'],
      payment: Array.isArray(post.payment) ? (post.payment as ApiPost['payment']) : undefined,
      barterAccepted: !!post.barterAccepted,
      expiresAt: post.expiresAt ? new Date(post.expiresAt).toISOString() : undefined,
      createdAt: post.createdAt.toISOString(),
      contactVisibility: post.contactVisibility ?? undefined,
      contactFlow: post.contactFlow ?? undefined,
      hasContact,
    }

    let safe: ApiPost
    switch (post.category) {
      case 'eventos':
        safe = {
          ...base,
          category: 'eventos',
          startDate: new Date(post.startDate as Date).toISOString(),
          endDate: post.endDate ? new Date(post.endDate).toISOString() : undefined,
          venue: post.venue as string,
          mode: post.mode as 'presencial' | 'online' | 'hibrido',
          capacity: typeof post.capacity === 'number' ? post.capacity : undefined,
          organizer: post.organizer ?? undefined,
        }
        break
      case 'servicios':
        safe = {
          ...base,
          category: 'servicios',
          experienceYears: typeof post.experienceYears === 'number' ? post.experienceYears : undefined,
          availability: post.availability ?? undefined,
          serviceArea: post.serviceArea ?? undefined,
        }
        break
      case 'productos':
        safe = {
          ...base,
          category: 'productos',
          condition: post.condition as 'nuevo' | 'reacondicionado',
          stock: typeof post.stock === 'number' ? post.stock : undefined,
          warranty: post.warranty ?? undefined,
        }
        break
      case 'usados':
        safe = {
          ...base,
          category: 'usados',
          condition: 'usado',
          usageTime: post.usageTime ?? undefined,
        }
        break
      case 'cursos':
        safe = {
          ...base,
          category: 'cursos',
          mode: post.mode as 'presencial' | 'online' | 'hibrido',
          duration: post.duration as string,
          schedule: post.schedule ?? undefined,
          level: post.level ?? undefined,
        }
        break
      case 'pedidos':
        safe = {
          ...base,
          category: 'pedidos',
          neededBy: post.neededBy ?? undefined,
          budgetRange: post.budgetRange ?? undefined,
        }
        break
      default:
        safe = base as ApiPost
        break
    }
    return NextResponse.json({ data: safe }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
