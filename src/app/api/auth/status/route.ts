import { NextResponse } from 'next/server'
import { getSSRAuth } from '@/lib/auth'

export async function GET() {
  const auth = await getSSRAuth()
  return NextResponse.json(auth)
}

