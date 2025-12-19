import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { allSeedPosts, type SeedPost } from '@/data/seed'
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

function mapContactToSocials(contact?: Record<string, string>): { name: string; url: string }[] {
  if (!contact) return []
  const entries = Object.entries(contact).filter(([, url]) => !!url) as Array<[string, string]>
  return entries.map(([name, url]) => ({ name, url }))
}

function authorEmail(authorName: string): string {
  const slug = normalize(authorName).replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
  return `${slug || 'author'}.seed@example.com`
}

type AuthorInfo = { id: string; avatar: string }

async function ensureAuthorUsers(): Promise<Map<string, AuthorInfo>> {
  const uniqueAuthors = Array.from(new Set(allSeedPosts.map(p => p.authorName)))
  const avatarByAuthor = new Map<string, string>()
  for (const p of allSeedPosts) {
    if (p.authorName && p.authorAvatar) avatarByAuthor.set(p.authorName, p.authorAvatar)
  }
  const map = new Map<string, AuthorInfo>()
  for (const authorName of uniqueAuthors) {
    const email = authorEmail(authorName)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundType=gradient&radius=50&fontWeight=700`
      map.set(authorName, { id: existing.id, avatar: existing.avatar ?? avatarByAuthor.get(authorName) ?? defaultAvatar })
      continue
    }
    const pw = await hashPassword('seed12345')
    const pPhone = Math.random() < 0.85
    const pDni = Math.random() < 0.85
    const statusRoll = Math.random()
    const status = statusRoll < 0.85 ? 'approved' : statusRoll < 0.95 ? 'pending' : 'rejected'
    const emailVerified = Math.random() < 0.7 ? new Date() : null
    const verifiedPublic = Math.random() < 0.5
    const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundType=gradient&radius=50&fontWeight=700`
    const avatar = avatarByAuthor.get(authorName) ?? defaultAvatar
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: pw,
        name: authorName,
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
    map.set(authorName, { id: created.id, avatar })
  }
  return map
}

function toCreateData(p: SeedPost, author?: AuthorInfo): Prisma.PostCreateManyInput {
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
    price: p.price ?? null,
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
    contactVisibility: 'gated',
    contactFlow: Math.random() < 0.5 ? 'seller_contacts' : 'buyer_contacts_first',
    termsAccepted: true,
    // Datos privados de ejemplo para el seed
    privateFullName: p.authorName,
    privatePhone: `+54 9 223 ${Math.floor(1000000 + Math.random()*8999999)}`,
    privateEmail: authorEmail(p.authorName),
    privateDni: `${Math.floor(10000000 + Math.random()*89999999)}`,
    privateDescription: 'Datos de prueba para moderación',
    createdIp: '127.0.0.1',
    createdUserAgent: 'seed-script',
    createdAcceptLanguage: 'es-AR',
    createdTimezone: 'America/Argentina/Buenos_Aires',
    createdReferrer: '/admin/seed',
  }

  // Campos específicos por categoría
  let categoryData: Record<string, unknown> = {}

  if (p.category === 'eventos') {
    categoryData = {
      startDate: (startDate && isValid(startDate)) ? startDate : (date && isValid(date)) ? date : new Date(),
      endDate: endDate && isValid(endDate) ? endDate : null,
      venue: 'venue' in p ? p.venue : 'Por definir',
      mode: mode ?? 'presencial',
      capacity: 'capacity' in p ? p.capacity : null,
      organizer: 'organizer' in p ? p.organizer : 'Organizador',
    }
  } else if (p.category === 'servicios') {
    categoryData = {
      experienceYears: 'experienceYears' in p ? p.experienceYears : null,
      availability: 'availability' in p ? p.availability : null,
      serviceArea: 'serviceArea' in p ? p.serviceArea : null,
    }
  } else if (p.category === 'productos') {
    categoryData = {
      condition: 'condition' in p ? p.condition : null,
      stock: 'stock' in p ? p.stock : null,
      warranty: 'warranty' in p ? p.warranty : null,
    }
  } else if (p.category === 'usados') {
    categoryData = {
      condition: 'usado' as const,
      usageTime: 'usageTime' in p ? p.usageTime : null,
    }
  } else if (p.category === 'cursos') {
    categoryData = {
      mode,
      duration: 'duration' in p ? p.duration : null,
      schedule: 'schedule' in p ? p.schedule : null,
      level: 'level' in p ? p.level : null,
    }
  } else if (p.category === 'pedidos') {
    categoryData = {
      neededBy: 'neededBy' in p ? p.neededBy : null,
      budgetRange: 'budgetRange' in p ? p.budgetRange : null,
    }
  }

  return {
    ...base,
    ...categoryData,
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
    const data = allSeedPosts.map(p => toCreateData(p, authorMap.get(p.authorName)))

    await prisma.post.createMany({ data })

    // Crear socials después de insertar posts
    const inserted: Array<{ id: string; title: string }> = await prisma.post.findMany({ select: { id: true, title: true } })
    for (const p of allSeedPosts) {
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
