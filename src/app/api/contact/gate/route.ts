import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { postId?: string; name?: string; email?: string; phone?: string }
    const postId = (body.postId ?? '').trim()
    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim()
    const phone = (body.phone ?? '').trim()
    if (!postId) return NextResponse.json({ error: 'postId_required' }, { status: 400 })
    if (!email || !name) return NextResponse.json({ error: 'name_email_required' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined
    const acceptLanguage = req.headers.get('accept-language') ?? undefined
    const referrer = req.headers.get('referer') ?? undefined

    await prisma.moderationLog.create({
      data: {
        actor: email || 'client',
        action: 'contact_gate',
        targetType: 'post',
        targetId: postId,
        reason: JSON.stringify({ name, email, phone, ip, userAgent, acceptLanguage, referrer }),
      },
    })

    const headers = new Headers()
    headers.append('Set-Cookie', `contact_gate_${postId}=1; Path=/; Max-Age=1800; SameSite=Lax`)
    return new NextResponse(JSON.stringify({ ok: true }), { status: 201, headers })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
