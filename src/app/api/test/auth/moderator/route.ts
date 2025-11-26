import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['moderator'])
  if (!auth.ok) return auth.res
  return NextResponse.json({ ok: true, role: auth.role, userId: auth.userId })
}
