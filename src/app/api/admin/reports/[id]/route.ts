import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['admin', 'moderator'])
  if (!auth.ok) return auth.res

  const { id } = await params

  await prisma.report.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
