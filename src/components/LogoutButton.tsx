"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
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
