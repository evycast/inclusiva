import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema, type RegisterInput } from '@/lib/validation/auth'
import { hashPassword } from '@/lib/password'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const input = registerSchema.parse(json) as RegisterInput
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

    const passwordHash = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name ?? null,
        role: 'user',
        status: 'pending',
      },
    })

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24)
    await prisma.verificationToken.create({
      data: { identifier: user.email, token, expires },
    })

    const verifyUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/auth/verify?token=${encodeURIComponent(token)}`
    await sendVerificationEmail(user.email, verifyUrl)
    return NextResponse.json({ data: { id: user.id, email: user.email }, verify_url: verifyUrl }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
