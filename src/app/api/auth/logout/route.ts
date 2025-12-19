import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('adminToken', '', { maxAge: 0, path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/', httpOnly: true, sameSite: 'lax', secure: true })
  res.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/', httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  res.cookies.set('__Secure-next-auth.csrf-token', '', { maxAge: 0, path: '/', httpOnly: false, sameSite: 'lax', secure: true })
  return res
}
