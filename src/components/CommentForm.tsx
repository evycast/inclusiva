"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import TextareaAutosize from 'react-textarea-autosize'
import { useCreateComment } from '@/hooks/useComments'
import { toast } from 'sonner'

export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('')
  const create = useCreateComment(postId)

  async function onSubmit() {
    const body = content.trim()
    if (body.length < 3) {
      toast.error('El comentario es muy corto')
      return
    }
    try {
      await create.mutateAsync({ content: body })
      setContent('')
      toast.success('Comentario enviado')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar'
      toast.error(msg)
    }
  }

  return (
    <div className='space-y-3'>
      <div className='sm:flex sm:items-end sm:gap-2'>
        <div className='flex-1'>
          <TextareaAutosize
            minRows={1}
            placeholder='Escribí tu comentario...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-0 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-hidden'
          />
        </div>
        <div className='mt-2 sm:mt-0'>
          <Button size='default' className='w-full sm:w-auto' onClick={onSubmit} disabled={create.isPending}>Enviar</Button>
        </div>
      </div>
      <p className='text-xs text-muted-foreground'>Los comentarios son públicos.</p>
    </div>
  )
}
