import { prisma } from '@/lib/prisma'
import { getSSRAuth } from '@/lib/auth'
import PostCard from '@/components/PostCard'
import type { ApiPost } from '@/types/api'
import type { Post, SocialLink, Prisma } from '@prisma/client'

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

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getSSRAuth()

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, avatar: true, verifiedPublic: true },
  })

  const includeNonApproved = auth.ok && (auth.role === 'admin' || auth.role === 'moderator' || auth.userId === id)
  const where: Prisma.PostWhereInput = includeNonApproved
    ? { authorId: id }
    : { authorId: id, status: 'approved', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }

  const posts = await prisma.post.findMany({ where, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], include: { socials: true, user: { select: { name: true, avatar: true, verifiedPublic: true } } } })

  const postCount = posts.length
  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 py-8'>
      <div className='relative rounded-2xl overflow-hidden mb-8 border border-border'>
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 opacity-20' />
        <div className='relative p-6 sm:p-8 flex items-center gap-4 sm:gap-6'>
          <div className='shrink-0'>
            <div className='rounded-full ring-4 ring-primary/30 shadow-md overflow-hidden w-20 h-20 sm:w-24 sm:h-24'>
              {/* Avatar simple sin blur */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user?.avatar ?? ''} alt={user?.name ?? 'Avatar'} className='w-full h-full object-cover' />
            </div>
          </div>
          <div className='min-w-0 flex-1'>
            <h1 className='text-xl sm:text-2xl font-semibold text-foreground'>{user?.name ?? 'Perfil'}</h1>
            <p className='text-sm text-muted-foreground'>{user?.email ?? ''}</p>
            <div className='mt-3 flex items-center gap-3'>
              <span className='inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground'>
                {postCount} publicaciones
              </span>
              {user?.verifiedPublic && (
                <span className='inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-emerald-600 border-emerald-300'>
                  Verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {posts.map((p) => (
          <PostCard key={p.id} post={toApiPost(p)} />
        ))}
      </section>
    </div>
  )
}
