import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email'
import { requireRole } from '@/lib/auth'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const auth = await requireRole(req, ['admin'])
    if (!auth.ok) return auth.res
  }
  try {
    const body = await req.json()
    const to = typeof body?.to === 'string' ? body.to : undefined
    if (!to) return NextResponse.json({ error: 'Missing to' }, { status: 400 })
    const id = await sendTestEmail(to)
    return NextResponse.json({ ok: true, id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
