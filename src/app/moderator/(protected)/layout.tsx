import { redirect } from 'next/navigation'
import React from 'react'
import { requireSSRRole } from '@/lib/auth'

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireSSRRole(['moderator'])
  if (!auth.ok) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
