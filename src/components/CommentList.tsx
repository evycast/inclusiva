"use client"

import { useComments, type CommentItem } from '@/hooks/useComments'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function CommentList({ postId }: { postId: string }) {
  const { data, isLoading } = useComments(postId)
  const raw = data?.data ?? []
  const items = sortDescByDate(raw)

  if (isLoading) return <div className='text-sm text-muted-foreground'>Cargando comentarios...</div>
  if (!items.length) return <div className='text-sm text-muted-foreground'>Sé el primer comentario</div>

  return (
    <div className='space-y-4'>
      {items.map((c) => (
        <div key={c.id} className='rounded-lg border border-border bg-card p-3'>
          <div className='flex items-start gap-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src={undefined} alt={c.guestName || 'Usuario'} />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium leading-tight'>{c.guestName || 'Usuario'}</div>
              <div className='text-sm text-muted-foreground whitespace-pre-line break-words'>
                {c.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function sortDescByDate(items: CommentItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
