import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { posts, type Post } from '@/data/posts'
import { Prisma } from '@prisma/client'
import { parseISO, isValid } from 'date-fns'
import { tagOptions } from '@/lib/validation/post'
import { hashPassword } from '@/lib/password'

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const TAG_SET = new Set(tagOptions.map(t => normalize(t)))

function mapContactToSocials(contact?: Record<string, string | undefined>): { name: string; url: string }[] {
  if (!contact) return []
  const entries = Object.entries(contact).filter(([, url]) => !!url) as Array<[string, string]>
  return entries.map(([name, url]) => ({ name, url }))
}

function authorEmail(author: string): string {
  const slug = normalize(author).replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
  return `${slug || 'author'}.seed@example.com`
}

type AuthorInfo = { id: string; avatar: string }
async function ensureAuthorUsers(): Promise<Map<string, AuthorInfo>> {
  const uniqueAuthors = Array.from(new Set(posts.map(p => p.author)))
  const avatarByAuthor = new Map<string, string>()
  for (const p of posts) {
    if (p.author && p.authorAvatar) avatarByAuthor.set(p.author, p.authorAvatar)
  }
  const map = new Map<string, AuthorInfo>()
  for (const author of uniqueAuthors) {
    const email = authorEmail(author)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      map.set(author, { id: existing.id, avatar: existing.avatar ?? (avatarByAuthor.get(author) ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(author)}&backgroundType=gradient&radius=50&fontWeight=700`) })
      continue
    }
    const pw = await hashPassword('seed12345')
    const pPhone = Math.random() < 0.85
    const pDni = Math.random() < 0.85
    const statusRoll = Math.random()
    const status = statusRoll < 0.85 ? 'approved' : statusRoll < 0.95 ? 'pending' : 'rejected'
    const emailVerified = Math.random() < 0.7 ? new Date() : null
    const verifiedPublic = Math.random() < 0.5
    const avatar = avatarByAuthor.get(author) ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(author)}&backgroundType=gradient&radius=50&fontWeight=700`
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: pw,
        name: author,
        avatar,
        role: 'user',
        status,
        emailVerified,
        verifiedPublic,
        phone: pPhone ? `+54 9 11 ${Math.floor(10000000 + Math.random()*89999999)}` : null,
        dni: pDni ? `${Math.floor(10000000 + Math.random()*89999999)}` : null,
      },
      select: { id: true },
    })
    map.set(author, { id: created.id, avatar })
  }
  return map
}

function toCreateData(p: Post, author?: AuthorInfo): Prisma.PostCreateManyInput {
  const date = p.date ? parseISO(p.date) : undefined
  const startDate = 'startDate' in p && p.startDate ? parseISO(p.startDate) : undefined
  const endDate = 'endDate' in p && p.endDate ? parseISO(p.endDate) : undefined

  const rawTags: string[] = Array.isArray(p.tags) ? p.tags : []
  const normalizedTags = rawTags
    .map(t => normalize(t))
    .filter(t => TAG_SET.has(t))

  // Normalize mode value (remove tildes)
  const modeRaw = ('mode' in p ? p.mode : undefined) as string | undefined
  const mode = modeRaw ? (normalize(modeRaw) as 'presencial' | 'online' | 'hibrido') : undefined


  const base: Prisma.PostCreateManyInput = {
    category: p.category,
    title: p.title,
    subtitle: p.subtitle ?? null,
    description: p.description || '',
    image: p.image,
    author: p.author,
    authorAvatar: (author?.avatar ?? p.authorAvatar) ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.author)}&backgroundType=gradient&radius=50&fontWeight=700`,
    location: p.location,
    price: p.price ?? null,
    priceLabel: p.priceLabel ?? null,
    rating: p.rating ?? null,
    ratingCount: p.ratingCount ?? null,
    tags: normalizedTags,
    urgent: !!p.urgent,
    date: date && isValid(date) ? date : null,
    payment: (p.payment ?? []) as unknown as Prisma.PostCreateManyInput['payment'],
    barterAccepted: !!p.barterAccepted,
    status: (() => {
      const r = Math.random();
      const s = r < 0.85 ? 'approved' : r < 0.95 ? 'pending' : 'rejected'
      return s as 'approved' | 'pending' | 'rejected'
    })(),
    authorId: author?.id ?? null,
    expiresAt: (() => {
      const baseDate = (date && isValid(date)) ? date : (endDate && isValid(endDate)) ? endDate : new Date()
      const days = 15 + Math.floor(Math.random() * 75)
      return new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * days)
    })(),
    privateInfo: 'Seed sample',
    contactVisibility: Math.random() < 0.8 ? 'public' : 'gated',
    contactFlow: Math.random() < 0.5 ? 'seller_contacts' : 'buyer_contacts_first',
    commitCommunity: Math.random() < 0.9,
    commitRespectRules: Math.random() < 0.95,
    createdIp: '127.0.0.1',
    createdUserAgent: 'seed-script',
    createdAcceptLanguage: 'es-AR',
    createdTimezone: 'America/Argentina/Buenos_Aires',
    createdReferrer: '/admin/seed',
  }

  const event = p.category === 'eventos' ? {
    startDate: startDate && isValid(startDate) ? startDate : null,
    endDate: endDate && isValid(endDate) ? endDate : null,
    venue: p.venue,
    mode,
    capacity: p.capacity ?? null,
    organizer: p.organizer,
  } : {}

  const service = p.category === 'servicios' ? {
    experienceYears: p.experienceYears ?? null,
    availability: p.availability,
    serviceArea: p.serviceArea,
  } : {}

  const product = p.category === 'productos' ? {
    condition: p.condition,
    stock: p.stock ?? null,
    warranty: p.warranty,
  } : {}

  const used = p.category === 'usados' ? {
    condition: 'usado' as const,
    usageTime: p.usageTime,
  } : {}

  const course = p.category === 'cursos' ? {
    mode,
    duration: p.duration,
    schedule: p.schedule,
    level: p.level,
  } : {}

  const request = p.category === 'pedidos' ? {
    neededBy: p.neededBy,
    budgetRange: p.budgetRange,
  } : {}

  return {
    ...base,
    ...event,
    ...service,
    ...product,
    ...used,
    ...course,
    ...request,
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res

  try {
    await prisma.socialLink.deleteMany({})
    await prisma.report.deleteMany({})
    await prisma.post.deleteMany({})
    await prisma.moderationLog.deleteMany({})
    await prisma.user.deleteMany({ where: { role: { not: 'admin' } } })

    // Crear admin por defecto si no existe
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (!existingAdmin) {
      const pw = await hashPassword('admin123')
      await prisma.user.create({
        data: {
          email: 'admin@admin.com',
          passwordHash: pw,
          role: 'admin',
          status: 'approved',
          name: 'Admin',
        },
      })
    }
    const authorMap = await ensureAuthorUsers()
    const data = posts.map(p => toCreateData(p, authorMap.get(p.author)))

    await prisma.post.createMany({ data })

    // create socials after inserting posts
    const inserted: Array<{ id: string; title: string }> = await prisma.post.findMany({ select: { id: true, title: true } })
    for (const p of posts) {
      const created = inserted.find(i => i.title === p.title)
      if (!created) continue
      const socials = mapContactToSocials(p.contact)
      if (socials.length > 0) {
        await prisma.socialLink.createMany({ data: socials.map(s => ({ postId: created.id, name: s.name, url: s.url })) })
      }
    }

    return NextResponse.json({ ok: true, inserted: inserted.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  try {
    await prisma.post.deleteMany({})
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Clear failed' }, { status: 500 })
  }
}
