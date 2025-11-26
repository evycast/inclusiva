import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { posts, type Post } from '@/data/posts'
import { Prisma } from '@prisma/client'
import { parseISO, isValid } from 'date-fns'
import { tagOptions } from '@/lib/validation/post'

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

function toCreateData(p: Post): Prisma.PostCreateManyInput {
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
    authorAvatar: p.authorAvatar ?? 'https://example.com/avatar.png',
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
    status: 'approved' as const,
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
    const data = posts.map(p => toCreateData(p))

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
