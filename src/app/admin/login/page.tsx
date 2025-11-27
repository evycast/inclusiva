'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// next-auth not used here; cookie is set by our API
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/status')
        if (!res.ok) return
        const data: unknown = await res.json()
        if (typeof data === 'object' && data && 'ok' in data && (data as { ok: boolean }).ok) {
          router.replace('/admin/posts')
        }
      } catch {}
    }
    check()
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      })
      if (!res.ok) {
        let message = `Error ${res.status}`
        try {
          const data: unknown = await res.json()
          if (typeof data === 'object' && data && 'error' in data) {
            const err = (data as { error: unknown }).error
            if (typeof err === 'string') message = err
          }
        } catch {}
        throw new Error(message)
      }
      await res.json()
      toast.success('Sesión iniciada')
      router.refresh()
      router.replace('/admin/posts')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de inicio de sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">Admin</span>
            <span className="text-muted-foreground ml-2">Login</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
