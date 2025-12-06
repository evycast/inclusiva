import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await getSSRAuth()
    const json = await req.json()
    const postId = String(json.postId || '')
    const reason = String(json.reason || '')
    const message = typeof json.message === 'string' ? json.message : undefined
    if (!postId || !reason) {
      return NextResponse.json({ error: 'Missing postId or reason' }, { status: 400 })
    }
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined
    const acceptLanguage = req.headers.get('accept-language') || undefined
    const timezone = req.headers.get('x-timezone') || undefined
    const referrer = req.headers.get('referer') || undefined
    const created = await prisma.report.create({
      data: {
        postId,
        userId: auth.userId ?? undefined,
        reason,
        message,
        ip,
        userAgent,
        acceptLanguage,
        timezone,
        referrer,
      },
    })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
