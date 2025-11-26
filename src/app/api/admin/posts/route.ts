import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildPostWhere, resolveOrderBy, type SortKey } from '@/lib/filters/postWhere'
import { requireRole } from '@/lib/auth'
import { postSchema, type PostInput } from '@/lib/validation/post'
import { parseISO, isValid } from 'date-fns'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res

  const sp = req.nextUrl.searchParams
  const page = Math.max(parseInt(sp.get('page') ?? '1', 10) || 1, 1)
  const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') ?? '12', 10) || 12, 1), 100)
  const q = sp.get('q') ?? undefined
  const category = sp.get('category') ?? undefined
  const urgent = sp.get('urgent') === 'true' ? true : sp.get('urgent') === 'false' ? false : undefined
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined
  const mode = (sp.get('mode') as 'presencial' | 'online' | 'hibrido') ?? undefined
  const status = (sp.get('status') as 'pending' | 'approved' | 'rejected') ?? undefined
  const sort = (sp.get('sort') as SortKey) ?? 'recent'

  const where = buildPostWhere({ q, category, urgent, minPrice, maxPrice, mode, status }, { includeNonApproved: true })
  const orderBy = resolveOrderBy(sort)

  const [total, data] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
  ])
  const totalPages = Math.ceil(total / pageSize) || 1

  return NextResponse.json({
    data,
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

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input: PostInput = parsed.data

  // const date = input.date ? parseISO(input.date) : undefined
  const startDate = 'startDate' in input && input.startDate ? parseISO(input.startDate) : undefined
  const endDate = 'endDate' in input && input.endDate ? parseISO(input.endDate) : undefined

  // Construir payload limpio por categoría y aplicar defaults
  const baseData = {
    category: input.category,
    title: input.title,
    subtitle: input.subtitle ?? null,
    description: input.description,
    image: input.image,
    author: input.author,
    authorAvatar: input.authorAvatar ?? null,
    location: input.location,
    price: input.price ?? null,
    priceLabel: input.priceLabel ?? null,
    rating: input.rating ?? null,
    ratingCount: input.ratingCount ?? null,
    tags: input.tags ?? [],
    urgent: input.urgent ?? false,
    date: new Date(),
    payment: input.payment ?? [],
    barterAccepted: input.barterAccepted ?? false,
    status: 'pending' as const,
  }

  let categoryData: Record<string, unknown> = {}
  switch (input.category) {
    case 'eventos': {
      categoryData = {
        startDate: startDate && isValid(startDate) ? startDate : new Date(),
        endDate: endDate && isValid(endDate) ? endDate : null,
        venue: input.venue,
        mode: input.mode,
        capacity: input.capacity ?? null,
        organizer: input.organizer ?? null,
      }
      break
    }
    case 'servicios': {
      categoryData = {
        experienceYears: input.experienceYears ?? null,
        availability: input.availability ?? null,
        serviceArea: input.serviceArea ?? null,
      }
      break
    }
    case 'productos': {
      categoryData = {
        condition: input.condition,
        stock: input.stock ?? null,
        warranty: input.warranty ?? null,
      }
      break
    }
    case 'usados': {
      categoryData = {
        condition: 'usado' as const,
        usageTime: input.usageTime ?? null,
      }
      break
    }
    case 'cursos': {
      categoryData = {
        mode: input.mode,
        duration: input.duration,
        schedule: input.schedule ?? null,
        level: input.level ?? null,
      }
      break
    }
    case 'pedidos': {
      categoryData = {
        neededBy: input.neededBy ?? null,
        budgetRange: input.budgetRange ?? null,
      }
      break
    }
  }

  const created = await prisma.post.create({
    data: {
      ...baseData,
      ...categoryData,
      socials: input.socials && input.socials.length > 0 ? {
        create: input.socials.map(s => ({ name: s.name, url: s.url }))
      } : undefined,
    },
  })

  return NextResponse.json({ data: created }, { status: 201 })
}
