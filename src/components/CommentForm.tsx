"use client";

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateComment } from '@/hooks/useComments'
import { toast } from 'sonner'

export default function CommentForm({ postId }: { postId: string }) {
  const [guestName, setGuestName] = useState('')
  const [content, setContent] = useState('')
  const create = useCreateComment(postId)

  async function onSubmit() {
    const body = content.trim()
    if (body.length < 3) {
      toast.error('El comentario es muy corto')
      return
    }
    try {
      await create.mutateAsync({ content: body, guestName: guestName.trim() || undefined })
      setContent('')
      toast.success('Comentario enviado')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar'
      toast.error(msg)
    }
  }

  return (
    <div className='space-y-3'>
      <div className='grid gap-3 sm:grid-cols-[1fr_2fr_auto] items-end'>
        <Input placeholder='Nombre (opcional)' value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        <Textarea rows={3} placeholder='Escribí tu comentario...' value={content} onChange={(e) => setContent(e.target.value)} />
        <Button onClick={onSubmit} disabled={create.isPending}>Enviar</Button>
      </div>
      <p className='text-xs text-muted-foreground'>Los comentarios son públicos. Límite de 500 caracteres.</p>
    </div>
  )
}
