import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema, type PostInput } from '@/lib/validation/post'
import { parseISO, isValid } from 'date-fns'
import { buildPostWhere, resolveOrderBy, type SortKey } from '@/lib/filters/postWhere'

function toApiPost(p: Record<string, unknown>) {
  return {
    id: (p as { id: string }).id,
    category: (p as { category: PostInput['category'] }).category,
    title: (p as { title: string }).title,
    subtitle: (p as { subtitle: string | null }).subtitle ?? undefined,
    description: (p as { description: string }).description,
    image: (p as { image: string }).image,
    author: (p as { author: string }).author,
    authorAvatar: (p as { authorAvatar: string | null }).authorAvatar ?? undefined,
    location: (p as { location: string }).location,
    price: typeof (p as { price: number | null }).price === 'number' ? (p as { price: number | null }).price : undefined,
    priceLabel: (p as { priceLabel: string | null }).priceLabel ?? undefined,
    rating: typeof (p as { rating: number | null }).rating === 'number' ? (p as { rating: number | null }).rating : undefined,
    ratingCount: typeof (p as { ratingCount: number | null }).ratingCount === 'number' ? (p as { ratingCount: number | null }).ratingCount : undefined,
    tags: Array.isArray((p as { tags: string[] | null }).tags) ? (p as { tags: string[] | null }).tags ?? undefined : undefined,
    urgent: !!(p as { urgent: boolean | null }).urgent,
    // Fecha de publicación
    date: (p as { date: Date | string | null }).date ? new Date((p as { date: Date | string | null }).date as Date | string).toISOString() : new Date().toISOString(),
    status: (p as { status: 'pending' | 'approved' | 'rejected' }).status,
    socials: Array.isArray((p as { socials: { name: string; url: string }[] | null }).socials)
      ? ((p as { socials: { name: string; url: string }[] }).socials).map((s) => ({ name: s.name, url: s.url }))
      : [],
    payment: Array.isArray((p as { payment: PostInput['payment'] | null }).payment) ? ((p as { payment: PostInput['payment'] }).payment) : undefined,
    barterAccepted: !!(p as { barterAccepted: boolean | null }).barterAccepted,

    // Evento
    startDate: (p as { startDate: Date | string | null }).startDate ? new Date((p as { startDate: Date | string | null }).startDate as Date | string).toISOString() : undefined,
    endDate: (p as { endDate: Date | string | null }).endDate ? new Date((p as { endDate: Date | string | null }).endDate as Date | string).toISOString() : undefined,
    venue: (p as { venue: string | null }).venue ?? undefined,
    mode: (p as { mode: 'presencial' | 'online' | 'hibrido' | null }).mode ?? undefined,
    capacity: typeof (p as { capacity: number | null }).capacity === 'number' ? (p as { capacity: number | null }).capacity : undefined,
    organizer: (p as { organizer: string | null }).organizer ?? undefined,

    // Servicio
    experienceYears: typeof (p as { experienceYears: number | null }).experienceYears === 'number' ? (p as { experienceYears: number | null }).experienceYears : undefined,
    availability: (p as { availability: string | null }).availability ?? undefined,
    serviceArea: (p as { serviceArea: string | null }).serviceArea ?? undefined,

    // Producto
    condition: (p as { condition: 'nuevo' | 'reacondicionado' | 'usado' | null }).condition ?? undefined,
    stock: typeof (p as { stock: number | null }).stock === 'number' ? (p as { stock: number | null }).stock : undefined,
    warranty: (p as { warranty: string | null }).warranty ?? undefined,

    // Usado
    usageTime: (p as { usageTime: string | null }).usageTime ?? undefined,

    // Curso
    duration: (p as { duration: string | null }).duration ?? undefined,
    schedule: (p as { schedule: string | null }).schedule ?? undefined,
    level: (p as { level: 'principiante' | 'intermedio' | 'avanzado' | null }).level ?? undefined,

    // Pedido
    neededBy: (p as { neededBy: string | null }).neededBy ?? undefined,
    budgetRange: (p as { budgetRange: string | null }).budgetRange ?? undefined,
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(parseInt(sp.get('page') ?? '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') ?? '12', 10) || 12, 1), 100)
    const q = sp.get('q') ?? undefined
    const category = sp.get('category') ?? undefined
    const sort = (sp.get('sort') as SortKey) ?? 'recent'

    // Público: sólo publicaciones aprobadas por defecto
    const where = buildPostWhere({ q, category })
    const orderBy = resolveOrderBy(sort)

    const [total, rows] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { socials: true } }),
    ])
    const totalPages = Math.ceil(total / pageSize) || 1

    return new Response(
      JSON.stringify({
        data: rows.map(toApiPost),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch posts'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const input = postSchema.parse(json) as PostInput

    // Construir payload limpio según categoría
    const baseData = {
      category: input.category,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description,
      image: input.image,
      author: input.author,
      authorAvatar: input.authorAvatar ?? null,
      location: input.location,
      price: typeof input.price === 'number' ? input.price : null,
      priceLabel: input.priceLabel ?? null,
      rating: typeof input.rating === 'number' ? input.rating : null,
      ratingCount: typeof input.ratingCount === 'number' ? input.ratingCount : null,
      tags: input.tags ?? [],
      urgent: !!input.urgent,
      // Fecha de publicación automática
      date: new Date(),
      payment: input.payment ?? [],
      barterAccepted: !!input.barterAccepted,
      status: 'pending',
    } as const

    let categoryData: Record<string, unknown> = {}

    switch (input.category) {
      case 'eventos': {
        const startDate = parseISO(input.startDate)
        const endDateStr = input.endDate as string | undefined
        const endDate = endDateStr ? parseISO(endDateStr) : undefined
        categoryData = {
          startDate: isValid(startDate) ? startDate : new Date(),
          endDate: endDate && isValid(endDate) ? endDate : null,
          venue: input.venue ?? null,
          mode: input.mode,
          capacity: typeof input.capacity === 'number' ? input.capacity : null,
          organizer: input.organizer ?? null,
        }
        break
      }
      case 'servicios': {
        categoryData = {
          experienceYears: typeof input.experienceYears === 'number' ? input.experienceYears : null,
          availability: input.availability ?? null,
          serviceArea: input.serviceArea ?? null,
        }
        break
      }
      case 'productos': {
        categoryData = {
          condition: input.condition,
          stock: typeof input.stock === 'number' ? input.stock : null,
          warranty: input.warranty ?? null,
        }
        break
      }
      case 'usados': {
        categoryData = {
          condition: 'usado',
          usageTime: input.usageTime ?? null,
        }
        break
      }
      case 'cursos': {
        categoryData = {
          mode: input.mode,
          duration: input.duration ?? null,
          schedule: input.schedule ?? null,
          level: input.level,
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
          create: input.socials.map((s) => ({ name: s.name, url: s.url }))
        } : undefined,
      },
      include: { socials: true },
    })

    return new Response(JSON.stringify({ data: toApiPost(created) }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
