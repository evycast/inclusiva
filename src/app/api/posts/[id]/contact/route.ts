import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'

const RL_POST = new Map<string, { ts: number; count: number }>()
const RL_GLOBAL = new Map<string, { ts: number; count: number }>()
function ipKey(raw?: string | null): string {
  if (!raw) return 'unknown'
  const v = raw.split(',')[0]?.trim() || raw.trim()
  return v || 'unknown'
}
function rateLimited(ip: string, id: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now()
  const perWindowMs = 60_000
  const perLimit = 3
  const gWindowMs = 600_000
  const gLimit = 30
  const k = `${ip}:${id}`
  const p = RL_POST.get(k)
  if (!p || now - p.ts > perWindowMs) {
    RL_POST.set(k, { ts: now, count: 1 })
  } else {
    p.count += 1
    RL_POST.set(k, p)
  }
  const g = RL_GLOBAL.get(ip)
  if (!g || now - g.ts > gWindowMs) {
    RL_GLOBAL.set(ip, { ts: now, count: 1 })
  } else {
    g.count += 1
    RL_GLOBAL.set(ip, g)
  }
  const pState = RL_POST.get(k)!
  const gState = RL_GLOBAL.get(ip)!
  if (pState.count > perLimit) {
    const retry = Math.ceil((perWindowMs - (now - pState.ts)) / 1000)
    return { limited: true, retryAfter: retry }
  }
  if (gState.count > gLimit) {
    const retry = Math.ceil((gWindowMs - (now - gState.ts)) / 1000)
    return { limited: true, retryAfter: retry }
  }
  return { limited: false }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({ where: { id }, include: { socials: true } })
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Restricción por estado y expiración
    if (post.status !== 'approved') {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }
    if (post.expiresAt && new Date(post.expiresAt) <= new Date()) {
      const auth = await getSSRAuth()
      const role = auth.role
      const isStaff = role === 'admin' || role === 'moderator'
      const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)
      if (!isStaff && !isAuthor) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    const auth = await getSSRAuth()
    const role = auth.role
    const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)

    const visibility = (post as { contactVisibility?: 'public' | 'gated' | null }).contactVisibility ?? 'public'
    const flow = (post as { contactFlow?: 'seller_contacts' | 'buyer_contacts_first' | null }).contactFlow ?? 'buyer_contacts_first'

    if (visibility === 'gated' || flow === 'seller_contacts') {
      return NextResponse.json({ error: 'contact_private' }, { status: 403 })
    }

    let allowed = isAuthor
    if (!allowed && visibility === 'public') {
      if (role === 'user' && auth.userId) {
        const u = await prisma.user.findUnique({ where: { id: auth.userId }, select: { status: true } })
        if (u?.status === 'approved') allowed = true
      }
      if (!allowed) {
        const gateCookie = req.cookies.get(`contact_gate_${id}`)?.value
        if (gateCookie === '1') allowed = true
      }
      if (!allowed) {
        return NextResponse.json({ error: 'contact_gated_required' }, { status: 403 })
      }
    }

    const socials = Array.isArray((post as unknown as { socials?: { name: string; url: string }[] | null }).socials)
      ? ((post as unknown as { socials: { name: string; url: string }[] }).socials).map((s) => ({ name: s.name, url: s.url }))
      : []

    return NextResponse.json({ data: { socials } }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    {
      const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      const ip = ipKey(rawIp)
      const rl = rateLimited(ip, id)
      if (rl.limited) {
        const h = new Headers({ 'Retry-After': String(rl.retryAfter ?? 60) })
        return new NextResponse(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: h })
      }
    }
    const post = await prisma.post.findUnique({ where: { id }, include: { socials: true } })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const auth = await getSSRAuth()
    const role = auth.role
    const isStaff = role === 'admin' || role === 'moderator'
    const isAuthor = !!auth.userId && !!(post as { authorId?: string | null }).authorId && ((post as { authorId?: string | null }).authorId === auth.userId)

    const visibility = (post as { contactVisibility?: 'public' | 'gated' | null }).contactVisibility ?? 'public'
    const flow = (post as { contactFlow?: 'seller_contacts' | 'buyer_contacts_first' | null }).contactFlow ?? 'buyer_contacts_first'

    const body = await req.json().catch(() => ({})) as { name?: string; email?: string; phone?: string; message?: string }
    let name = (body.name ?? '').toString().trim()
    let email = (body.email ?? '').toString().trim()
    let phone = (body.phone ?? '').toString().trim()
    const message = (body.message ?? '').toString().trim() || undefined

    if (auth.ok && auth.userId) {
      const u = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true, email: true, phone: true, status: true } })
      // Prefill missing fields from user
      name = name || (u?.name ?? '')
      email = email || (u?.email ?? '')
      phone = phone || (u?.phone ?? '')
    }

    // seller_contacts: siempre registra solicitud, no revela contactos
    if (flow === 'seller_contacts') {
      if (!name || !phone) return NextResponse.json({ error: 'name_phone_required' }, { status: 400 })
      await prisma.moderationLog.create({
        data: {
          actor: auth.userId ?? 'buyer',
          action: 'contact_request',
          targetType: 'post',
          targetId: id,
          reason: JSON.stringify({ name, phone, email: email || undefined, message, ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined, acceptLanguage: req.headers.get('accept-language') ?? undefined, referrer: req.headers.get('referer') ?? undefined }),
        },
      })
      return NextResponse.json({ ok: true })
    }

    // gated: nunca revela, sólo permite staff/author GET (ya manejado en GET). POST registra solicitud similar a seller_contacts
    if (visibility === 'gated') {
      if (!name || !phone) return NextResponse.json({ error: 'name_phone_required' }, { status: 400 })
      await prisma.moderationLog.create({
        data: {
          actor: auth.userId ?? 'buyer',
          action: 'contact_request',
          targetType: 'post',
          targetId: id,
          reason: JSON.stringify({ name, phone, email: email || undefined, message, ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined, acceptLanguage: req.headers.get('accept-language') ?? undefined, referrer: req.headers.get('referer') ?? undefined }),
        },
      })
      return NextResponse.json({ ok: true })
    }

    // public + buyer_contacts_first: requiere datos básicos, setea cookie y devuelve contactos
    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'basic_required' }, { status: 400 })
    }
    await prisma.moderationLog.create({
      data: {
        actor: auth.userId ?? 'buyer',
        action: 'contact_gate',
        targetType: 'post',
        targetId: id,
        reason: JSON.stringify({ name, email, phone, ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined, acceptLanguage: req.headers.get('accept-language') ?? undefined, referrer: req.headers.get('referer') ?? undefined }),
      },
    })
    const socials = Array.isArray((post as unknown as { socials?: { name: string; url: string }[] | null }).socials)
      ? ((post as unknown as { socials: { name: string; url: string }[] }).socials).map((s) => ({ name: s.name, url: s.url }))
      : []
    const res = NextResponse.json({ data: { socials } }, { status: 200 })
    res.cookies.set(`contact_gate_${id}`, '1', { path: '/', maxAge: 60 * 60 * 24 * 7, httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to process contact' }, { status: 500 })
  }
}
