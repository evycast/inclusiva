import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const role = await getRoleFromRequest(req)
  return NextResponse.json({ ok: true, role: role ?? null })
}
