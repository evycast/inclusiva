import { NextResponse } from 'next/server'
import { getSSRAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getSSRAuth()
  if (auth.ok && auth.userId) {
    const u = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true, email: true, phone: true, status: true, role: true } })
    return NextResponse.json({ ok: true, role: u?.role ?? auth.role, userId: auth.userId, user: { name: u?.name, email: u?.email, phone: u?.phone, status: u?.status } })
  }
  return NextResponse.json(auth)
}
