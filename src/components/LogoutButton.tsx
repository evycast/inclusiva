"use client"

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
          await signOut({ redirect: false })
          try { localStorage.removeItem('contactUser') } catch {}
        } finally {
          router.refresh()
          router.replace('/admin/login')
        }
      }}
    >
      Cerrar sesión
    </Button>
  )
}
