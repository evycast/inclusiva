import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['admin', 'moderator'])
  if (!auth.ok) return auth.res

  const sp = req.nextUrl.searchParams
  const page = Math.max(parseInt(sp.get('page') ?? '1', 10) || 1, 1)
  const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') ?? '20', 10) || 20, 1), 100)

  const [total, reports] = await Promise.all([
    prisma.report.count(),
    prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(total / pageSize) || 1

  return NextResponse.json({
    data: reports.map((r) => ({
      id: r.id,
      postId: r.postId,
      userId: r.userId,
      reason: r.reason,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      post: r.post ? {
        id: r.post.id,
        title: r.post.title,
        category: r.post.category,
      } : null,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}
