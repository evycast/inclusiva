import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { updatePostSchema } from '@/lib/validation/post'
import { parseISO, isValid, addDays } from 'date-fns'

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

  if (input.status === 'rejected') {
    const reason = String((body as { reason?: string }).reason ?? '').trim()
    if (!reason) {
      return NextResponse.json({ error: 'reason_required' }, { status: 400 })
    }
  }

  const date = input.date ? parseISO(input.date) : undefined
  const startDate = 'startDate' in input && input.startDate ? parseISO(input.startDate) : undefined
  const endDate = 'endDate' in input && input.endDate ? parseISO(input.endDate) : undefined
  
  // Al aprobar o actualizar, se resetea la fecha de expiración a 30 días desde ahora
  const shouldResetExpiry = input.status === 'approved' || !input.expiresAt
  const expiresAt = shouldResetExpiry ? addDays(new Date(), 30) : (input.expiresAt ? parseISO(input.expiresAt) : undefined)

  // Update scalar fields
  const updated = await prisma.post.update({
    where: { id },
    data: {
      category: input.category ?? undefined,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      image: input.image,
      price: input.price,
      rating: input.rating,
      ratingCount: input.ratingCount,
      tags: input.tags ? { set: input.tags } : undefined,
      urgent: input.urgent,
      date: date && isValid(date) ? date : undefined,
      payment: input.payment ? { set: input.payment } : undefined,
      barterAccepted: input.barterAccepted,
      expiresAt: expiresAt && isValid(expiresAt) ? expiresAt : (shouldResetExpiry ? addDays(new Date(), 30) : undefined),
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
      termsAccepted: 'termsAccepted' in input ? input.termsAccepted : undefined,
      contactVisibility: 'contactVisibility' in input ? input.contactVisibility : undefined,
      contactFlow: 'contactFlow' in input ? input.contactFlow : undefined,
      privateFullName: 'privateFullName' in input ? input.privateFullName : undefined,
      privatePhone: 'privatePhone' in input ? input.privatePhone : undefined,
      privateEmail: 'privateEmail' in input ? input.privateEmail : undefined,
      privateDni: 'privateDni' in input ? input.privateDni : undefined,
      privateDescription: 'privateDescription' in input ? input.privateDescription : undefined,
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

  let emailPreviewUrl: string | undefined
  if (input.status === 'rejected') {
    const reason = String((body as { reason?: string }).reason ?? '').trim()
    const after = await prisma.post.findUnique({ where: { id }, include: { user: true } })
    const to = (after?.user?.email ?? '')
    const sp = new URLSearchParams()
    sp.set('postId', id)
    sp.set('reason', reason)
    if (to) sp.set('to', to)
    emailPreviewUrl = `/sim/email/moderation?${sp.toString()}`
  }
  return NextResponse.json({ data: updated, emailPreviewUrl })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin'])
  if (!auth.ok) return auth.res
  const { id } = await params
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
