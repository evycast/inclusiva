"use client"

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'register'

function AuthContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const nextUrl = sp.get('next') || '/publicaciones'
  
  // Determinar modo inicial basado en query param
  const initialMode = sp.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  
  // Campos compartidos
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Campos solo para registro
  const [name, setName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Completá email y contraseña')
      return
    }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        toast.error('Credenciales inválidas')
        return
      }
      
      if (result?.ok) {
        toast.success('¡Sesión iniciada!')
        window.dispatchEvent(new Event('auth-change'))
        router.refresh()
        router.replace(nextUrl)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Completá email y contraseña')
      return
    }
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
      toast.success('¡Registro exitoso! Iniciando sesión...')
      
      // Login automático después del registro exitoso
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.ok) {
        window.dispatchEvent(new Event('auth-change'))
        router.refresh()
        router.replace(nextUrl)
      } else {
        router.replace(nextUrl)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de registro'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    // Limpiar campos al cambiar de modo
    setPassword('')
    setShowPassword(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Fondo con gradiente sutil */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/30" />
      
      {/* Botón volver */}
      <div className="w-full max-w-md mb-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="text-center pb-2">
          {/* Logo o título de la app */}
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500">
            {mode === 'login' ? (
              <LogIn className="h-7 w-7 text-white" />
            ) : (
              <UserPlus className="h-7 w-7 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === 'login' 
              ? 'Ingresá tus datos para continuar' 
              : 'Registrate para publicar y conectar'}
          </CardDescription>
        </CardHeader>

        {/* Tabs de modo */}
        <div className="px-6 pt-2">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        <CardContent className="pt-6">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {/* Campo nombre solo para registro */}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Tu nombre"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón submit */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 hover:opacity-90 transition-opacity"
              disabled={loading}
              size="lg"
            >
              {loading 
                ? (mode === 'login' ? 'Iniciando...' : 'Registrando...') 
                : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
            </Button>
          </form>

          {/* Texto alternativo */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-medium text-primary hover:underline"
                >
                  Registrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-medium text-primary hover:underline"
                >
                  Iniciá sesión
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Mensaje informativo cuando viene de /crear */}
      {nextUrl.includes('/crear') && (
        <p className="mt-4 text-center text-sm text-muted-foreground max-w-md">
          Para publicar necesitás una cuenta. Después de {mode === 'login' ? 'iniciar sesión' : 'registrarte'} 
          {' '}vas a poder crear tu publicación.
        </p>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
