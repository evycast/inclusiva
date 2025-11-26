"use client";

import { useComments } from '@/hooks/useComments'

export default function CommentList({ postId }: { postId: string }) {
  const { data, isLoading } = useComments(postId)
  const items = data?.data ?? []

  if (isLoading) return <div className='text-sm text-muted-foreground'>Cargando comentarios...</div>
  if (!items.length) return <div className='text-sm text-muted-foreground'>Sé el primero en comentar</div>

  return (
    <div className='space-y-4'>
      {items.map((c) => (
        <div key={c.id} className='rounded-lg border border-border bg-card p-3 text-sm'>
          <div className='mb-1 font-medium'>{c.guestName || 'Usuario'}</div>
          <div className='text-muted-foreground whitespace-pre-line'>{c.content}</div>
        </div>
      ))}
    </div>
  )
}
