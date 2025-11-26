import { redirect } from 'next/navigation'
import React from 'react'
import { requireSSRRole } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireSSRRole(['admin'])
  if (!auth.ok) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
