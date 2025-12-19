import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema, type PostInput } from '@/lib/validation/post'
import { parseISO, isValid, addDays } from 'date-fns'
import { buildPostWhere, resolveOrderBy, type SortKey } from '@/lib/filters/postWhere'
import { getSSRAuth } from '@/lib/auth'

interface PostRecord {
  id: string
  authorId: string | null
  category: PostInput['category']
  title: string
  subtitle: string | null
  description: string
  image: string
  price: string | null
  rating: number | null
  ratingCount: number | null
  tags: string[] | null
  urgent: boolean | null
  date: Date | string | null
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  socials: Array<{ name: string; url: string }>
  payment: PostInput['payment'] | null
  barterAccepted: boolean | null
  startDate: Date | string | null
  endDate: Date | string | null
  venue: string | null
  mode: 'presencial' | 'online' | 'hibrido' | null
  capacity: number | null
  organizer: string | null
  experienceYears: number | null
  availability: string | null
  serviceArea: string | null
  condition: 'nuevo' | 'reacondicionado' | 'usado' | null
  stock: number | null
  warranty: string | null
  usageTime: string | null
  duration: string | null
  schedule: string | null
  level: 'principiante' | 'intermedio' | 'avanzado' | null
  neededBy: string | null
  budgetRange: string | null
  contactVisibility: 'public' | 'gated' | null
  contactFlow: 'seller_contacts' | 'buyer_contacts_first' | null
  user?: { name: string | null; avatar: string | null; verifiedPublic: boolean } | null
}

function toApiPost(p: PostRecord) {
  return {
    id: p.id,
    authorId: p.authorId ?? undefined,
    category: p.category,
    title: p.title,
    subtitle: p.subtitle ?? undefined,
    description: p.description,
    image: p.image,
    // Datos del autor desde la relación User
    authorName: p.user?.name ?? undefined,
    authorAvatar: p.user?.avatar ?? undefined,
    authorVerified: p.user?.verifiedPublic ?? false,
    price: p.price ?? undefined,
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : undefined,
    tags: Array.isArray(p.tags) ? p.tags : undefined,
    urgent: !!p.urgent,
    date: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    status: p.status,
    socials: Array.isArray(p.socials)
      ? p.socials.map((s) => ({ name: s.name, url: s.url }))
      : [],
    payment: Array.isArray(p.payment) ? p.payment : undefined,
    barterAccepted: !!p.barterAccepted,
    // Evento
    startDate: p.startDate ? new Date(p.startDate).toISOString() : undefined,
    endDate: p.endDate ? new Date(p.endDate).toISOString() : undefined,
    venue: p.venue ?? undefined,
    mode: p.mode ?? undefined,
    capacity: typeof p.capacity === 'number' ? p.capacity : undefined,
    organizer: p.organizer ?? undefined,
    // Servicio
    experienceYears: typeof p.experienceYears === 'number' ? p.experienceYears : undefined,
    availability: p.availability ?? undefined,
    serviceArea: p.serviceArea ?? undefined,
    // Producto
    condition: p.condition ?? undefined,
    stock: typeof p.stock === 'number' ? p.stock : undefined,
    warranty: p.warranty ?? undefined,
    // Usado
    usageTime: p.usageTime ?? undefined,
    // Curso
    duration: p.duration ?? undefined,
    schedule: p.schedule ?? undefined,
    level: p.level ?? undefined,
    // Pedido
    neededBy: p.neededBy ?? undefined,
    budgetRange: p.budgetRange ?? undefined,
    contactVisibility: p.contactVisibility ?? undefined,
    contactFlow: p.contactFlow ?? undefined,
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
    const location = sp.get('location') ?? undefined
    const paymentCsv = sp.get('payment') ?? ''
    const payment = paymentCsv
      ? paymentCsv.split(',').map((s) => s.trim()).filter((s) => s.length > 0) as ('cash'|'debit'|'credit'|'transfer'|'mercadopago'|'crypto')[]
      : undefined

    // Público: sólo publicaciones aprobadas por defecto
    const where = buildPostWhere({ q, category, payment, location })
    const orderBy = resolveOrderBy(sort)

    const [total, rows] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          socials: true,
          user: { select: { name: true, avatar: true, verifiedPublic: true } },
        },
      }),
    ])
    const totalPages = Math.ceil(total / pageSize) || 1

    return new Response(
      JSON.stringify({
        data: rows.map((r) => toApiPost(r as unknown as PostRecord)),
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

    // Verificar autenticación
    const auth = await getSSRAuth()
    if (!auth.ok || !auth.userId) {
      return new Response(JSON.stringify({ error: 'Debes iniciar sesión para publicar' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verificar que se acepten los términos
    if (!input.termsAccepted) {
      return new Response(JSON.stringify({ error: 'Debes aceptar los términos y condiciones' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Construir payload limpio según categoría
    const baseData = {
      category: input.category,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description,
      image: input.image,
      price: input.price ?? null,
      rating: typeof input.rating === 'number' ? input.rating : null,
      ratingCount: typeof input.ratingCount === 'number' ? input.ratingCount : null,
      tags: input.tags ?? [],
      urgent: !!input.urgent,
      date: new Date(),
      payment: input.payment ?? [],
      barterAccepted: !!input.barterAccepted,
      contactVisibility: input.contactVisibility ?? 'gated',
      contactFlow: input.contactFlow ?? 'seller_contacts',
      termsAccepted: !!input.termsAccepted,
      // Datos privados de moderación
      privateFullName: input.privateFullName ?? null,
      privatePhone: input.privatePhone ?? null,
      privateEmail: input.privateEmail ?? null,
      privateDni: input.privateDni ?? null,
      privateDescription: input.privateDescription ?? null,
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

    const ip = req.headers.get('x-forwarded-for') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined
    const acceptLanguage = req.headers.get('accept-language') ?? undefined
    const referrer = req.headers.get('referer') ?? undefined

    // Fecha de expiración: 30 días desde la creación
    const expiresAt = addDays(new Date(), 30)

    const created = await prisma.post.create({
      data: {
        ...baseData,
        ...categoryData,
        authorId: auth.userId,
        expiresAt,
        createdIp: ip ?? null,
        createdUserAgent: userAgent ?? null,
        createdAcceptLanguage: acceptLanguage ?? null,
        createdReferrer: referrer ?? null,
        socials: input.socials && input.socials.length > 0 ? {
          create: input.socials.map((s) => ({ name: s.name, url: s.url }))
        } : undefined,
      },
      include: {
        socials: true,
        user: { select: { name: true, avatar: true, verifiedPublic: true } },
      },
    })

    return new Response(JSON.stringify({ data: toApiPost(created as unknown as PostRecord) }), {
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
