import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'
import PostCard from '@/components/PostCard'
import type { ApiPost } from '@/types/api'
import type { Post, SocialLink } from '@prisma/client'
import { User, Mail, Shield, CheckCircle, Calendar, FileText } from 'lucide-react'

function toApiPost(p: Post & { socials: SocialLink[]; user?: { name: string | null; avatar: string | null; verifiedPublic: boolean } | null }): ApiPost {
  const obj = {
    id: p.id,
    authorId: p.authorId ?? undefined,
    category: p.category,
    title: p.title,
    subtitle: p.subtitle ?? undefined,
    description: p.description,
    image: p.image,
    authorName: p.user?.name ?? 'Anónimo',
    authorAvatar: p.user?.avatar ?? undefined,
    authorVerified: !!p.user?.verifiedPublic,
    price: p.price ?? undefined,
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : undefined,
    tags: Array.isArray(p.tags) ? (p.tags as ApiPost['tags']) : undefined,
    urgent: !!p.urgent,
    date: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    status: p.status,
    socials: Array.isArray(p.socials) ? p.socials.map((s) => ({ name: s.name, url: s.url })) : [],
    payment: Array.isArray(p.payment) ? p.payment : undefined,
    barterAccepted: !!p.barterAccepted,
    startDate: p.startDate ? new Date(p.startDate).toISOString() : undefined,
    endDate: p.endDate ? new Date(p.endDate).toISOString() : undefined,
    venue: p.venue ?? undefined,
    mode: p.mode ?? undefined,
    capacity: typeof p.capacity === 'number' ? p.capacity : undefined,
    organizer: p.organizer ?? undefined,
    experienceYears: typeof p.experienceYears === 'number' ? p.experienceYears : undefined,
    availability: p.availability ?? undefined,
    serviceArea: p.serviceArea ?? undefined,
    condition: p.condition ?? undefined,
    stock: typeof p.stock === 'number' ? p.stock : undefined,
    warranty: p.warranty ?? undefined,
    usageTime: p.usageTime ?? undefined,
    duration: p.duration ?? undefined,
    schedule: p.schedule ?? undefined,
    level: p.level ?? undefined,
    neededBy: p.neededBy ?? undefined,
    budgetRange: p.budgetRange ?? undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString() : undefined,
  } as unknown as ApiPost
  return obj
}

// Labels en español para roles
const roleLabels: Record<string, string> = {
  user: 'Usuario',
  admin: 'Administrador',
  moderator: 'Moderador',
  staff: 'Staff',
}

// Labels en español para estados
const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export default async function PerfilPage() {
  const auth = await getSSRAuth()
  
  // Si no está logueado, redirigir a login
  if (!auth.ok || !auth.userId) {
    redirect('/login')
  }

  // Obtener datos del usuario logueado
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      verifiedPublic: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Obtener publicaciones del usuario
  const posts = await prisma.post.findMany({
    where: { authorId: auth.userId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { 
      socials: true, 
      user: { select: { name: true, avatar: true, verifiedPublic: true } } 
    },
  })

  const emailVerified = !!user.emailVerified
  const publicVerified = !!user.verifiedPublic
  const postCount = posts.length
  const approvedCount = posts.filter(p => p.status === 'approved').length
  const pendingCount = posts.filter(p => p.status === 'pending').length

  return (
    <div className='mx-auto max-w-5xl px-4 sm:px-6 py-8'>
      {/* Header del perfil */}
      <div className='relative rounded-2xl overflow-hidden mb-8 border border-border bg-card'>
        {/* Fondo con gradiente */}
        <div className='absolute inset-0 bg-gradient-to-br from-pink-500/20 via-violet-600/20 to-indigo-600/20' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent' />
        
        <div className='relative p-6 sm:p-8'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            {/* Avatar */}
            <div className='shrink-0'>
              <div className='relative'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 p-1'>
                  <div className='w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden'>
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name ?? 'Avatar'} className='w-full h-full object-cover' />
                    ) : (
                      <User className='w-12 h-12 text-muted-foreground' />
                    )}
                  </div>
                </div>
                {publicVerified && (
                  <div className='absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-card'>
                    <CheckCircle className='w-4 h-4 text-white' />
                  </div>
                )}
              </div>
            </div>

            {/* Info principal */}
            <div className='flex-1 text-center sm:text-left'>
              <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
                {user.name || 'Sin nombre'}
              </h1>
              <p className='text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-2'>
                <Mail className='w-4 h-4' />
                {user.email}
              </p>
              
              {/* Badges */}
              <div className='mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 px-3 py-1 text-sm text-pink-600'>
                  <Shield className='w-3.5 h-3.5' />
                  {roleLabels[user.role] || user.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                  user.status === 'approved' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600' 
                    : user.status === 'pending'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600'
                    : 'bg-red-500/10 border border-red-500/20 text-red-600'
                }`}>
                  {statusLabels[user.status] || user.status}
                </span>
                {emailVerified && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-sm text-blue-600'>
                    <CheckCircle className='w-3.5 h-3.5' />
                    Email verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-foreground'>{postCount}</div>
              <div className='text-sm text-muted-foreground'>Publicaciones</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-emerald-600'>{approvedCount}</div>
              <div className='text-sm text-muted-foreground'>Aprobadas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-amber-600'>{pendingCount}</div>
              <div className='text-sm text-muted-foreground'>Pendientes</div>
            </div>
          </div>

          {/* Fecha de registro */}
          <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Calendar className='w-4 h-4' />
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </div>
        </div>
      </div>

      {/* Publicaciones del usuario */}
      <section>
        <div className='flex items-center gap-2 mb-6'>
          <FileText className='w-5 h-5 text-muted-foreground' />
          <h2 className='text-xl font-semibold'>Mis publicaciones</h2>
        </div>
        
        {posts.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border p-8 text-center'>
            <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
            <p className='text-muted-foreground'>Aún no tenés publicaciones</p>
            <a 
              href='/publicaciones/crear'
              className='inline-flex mt-4 items-center rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition'
            >
              Crear mi primera publicación
            </a>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {posts.map((p) => (
              <PostCard key={p.id} post={toApiPost(p)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
