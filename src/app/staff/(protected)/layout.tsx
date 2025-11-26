import { redirect } from 'next/navigation'
import React from 'react'
import { requireSSRRole } from '@/lib/auth'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireSSRRole(['admin', 'moderator'])
  if (!auth.ok) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
