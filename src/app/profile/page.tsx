import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'

export default async function ProfilePage() {
  const auth = await getSSRAuth()
  if (!auth.ok || !auth.userId) {
    redirect('/admin/login')
  }
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerified: true,
      verifiedPublic: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  if (!user) {
    redirect('/admin/login')
  }
  const emailVerified = !!user.emailVerified
  const publicVerified = !!user.verifiedPublic
  const accountStatus = user.status

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Perfil</h1>
      <div className="grid gap-4">
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">ID</div>
          <div className="font-mono text-sm">{user.id}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Nombre</div>
          <div className="font-medium">{user.name ?? '—'}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Rol</div>
          <div className="font-medium capitalize">{user.role}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Estado de cuenta</div>
          <div className="font-medium capitalize">{accountStatus}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Email verificado</div>
          <div className="font-medium">{emailVerified ? 'Sí' : 'No'}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Verificación pública (badge)</div>
          <div className="font-medium">{publicVerified ? 'Sí' : 'No'}</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Fechas</div>
          <div className="text-sm">Creado: {new Date(user.createdAt).toLocaleString()}</div>
          <div className="text-sm">Actualizado: {new Date(user.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
