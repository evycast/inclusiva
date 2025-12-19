"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function AdminLoginContent() {
  const router = useRouter()
  const sp = useSearchParams()
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
          const role = (data as { role?: 'user'|'moderator'|'admin' }).role
          const nextParam = sp.get('next')
          if (nextParam) {
            router.replace(nextParam)
            return
          }
          if (role === 'admin') {
            router.replace('/admin/posts')
          } else {
            router.replace('/publicaciones')
          }
        }
      } catch {}
    }
    check()
  }, [router, sp])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', { email: username, password, redirect: false })
      if (res?.error) throw new Error(res.error)
      toast.success('Sesión iniciada')
      try {
        const status = await fetch('/api/auth/status')
        const data: unknown = await status.json()
        const role = typeof data === 'object' && data && 'role' in data ? (data as { role?: 'user'|'moderator'|'admin' }).role : undefined
        const nextParam = sp.get('next')
        if (nextParam) {
          router.replace(nextParam)
        } else if (role === 'admin') {
          router.replace('/admin/posts')
        } else {
          router.replace('/publicaciones')
        }
      } catch {
        const nextParam = sp.get('next')
        router.replace(nextParam || '/publicaciones')
      }
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

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-3rem)] flex items-center justify-center">Cargando...</div>}>
      <AdminLoginContent />
    </Suspense>
  )
}
