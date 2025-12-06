"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email, password }),
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
      toast.success('Registro enviado. Revisá tu email para verificar tu cuenta.')
      router.refresh()
      router.replace('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de registro'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <Card className="w-full max-w-md border-border/50 bg-card/ py-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Registro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
