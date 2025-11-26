import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { updatePostSchema } from '@/lib/validation/post'
import { parseISO, isValid } from 'date-fns'

const patchSchema = updatePostSchema

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  const date = input.date ? parseISO(input.date) : undefined
  const startDate = 'startDate' in input && input.startDate ? parseISO(input.startDate) : undefined
  const endDate = 'endDate' in input && input.endDate ? parseISO(input.endDate) : undefined

  // Update scalar fields
  const updated = await prisma.post.update({
    where: { id },
    data: {
      category: input.category ?? undefined,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      image: input.image,
      author: input.author,
      authorAvatar: input.authorAvatar,
      location: input.location,
      price: input.price,
      priceLabel: input.priceLabel,
      rating: input.rating,
      ratingCount: input.ratingCount,
      tags: input.tags ? { set: input.tags } : undefined,
      urgent: input.urgent,
      date: date && isValid(date) ? date : undefined,
      payment: input.payment ? { set: input.payment } : undefined,
      barterAccepted: input.barterAccepted,
      startDate: startDate && isValid(startDate) ? startDate : undefined,
      endDate: endDate && isValid(endDate) ? endDate : undefined,
      venue: 'venue' in input ? input.venue : undefined,
      mode: 'mode' in input ? input.mode : undefined,
      capacity: 'capacity' in input ? input.capacity : undefined,
      organizer: 'organizer' in input ? input.organizer : undefined,
      experienceYears: 'experienceYears' in input ? input.experienceYears : undefined,
      availability: 'availability' in input ? input.availability : undefined,
      serviceArea: 'serviceArea' in input ? input.serviceArea : undefined,
      condition: 'condition' in input ? input.condition : undefined,
      stock: 'stock' in input ? input.stock : undefined,
      warranty: 'warranty' in input ? input.warranty : undefined,
      usageTime: 'usageTime' in input ? input.usageTime : undefined,
      duration: 'duration' in input ? input.duration : undefined,
      schedule: 'schedule' in input ? input.schedule : undefined,
      level: 'level' in input ? input.level : undefined,
      neededBy: 'neededBy' in input ? input.neededBy : undefined,
      budgetRange: 'budgetRange' in input ? input.budgetRange : undefined,
      status: input.status,
    },
  })

  // Replace socials if provided
  if (input.socials) {
    await prisma.$transaction([
      prisma.socialLink.deleteMany({ where: { postId: id } }),
      prisma.socialLink.createMany({ data: input.socials.map(s => ({ postId: id, name: s.name, url: s.url })) }),
    ])
  }

  if (typeof input.status === 'string') {
    await prisma.moderationLog.create({
      data: {
        actor: (auth.ok ? (auth as { ok: true; userId?: string }).userId : undefined) ?? 'admin',
        action: `post_status_${input.status}`,
        targetType: 'post',
        targetId: id,
        reason: typeof (body as { reason?: string })?.reason === 'string' ? body.reason : null,
      },
    })
  } else {
    await prisma.moderationLog.create({
      data: {
        actor: (auth.ok ? (auth as { ok: true; userId?: string }).userId : undefined) ?? 'admin',
        action: 'post_update',
        targetType: 'post',
        targetId: id,
        reason: null,
      },
    })
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  const { id } = await params
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
