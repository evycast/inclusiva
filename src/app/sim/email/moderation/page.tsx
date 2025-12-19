"use client"

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type ApiPost = {
  id: string
  title: string
  category: string
  author: string
}

export default function ModerationEmailPreviewPage() {
  return (
    <Suspense fallback={<div className='mx-auto max-w-3xl px-4 py-8 text-muted-foreground'>Cargando…</div>}>
      <ModerationEmailPreviewContent />
    </Suspense>
  )
}

function ModerationEmailPreviewContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const postId = sp.get('postId') || ''
  const to = sp.get('to') || ''
  const reason = sp.get('reason') || ''
  const [post, setPost] = useState<ApiPost | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!postId) {
        setError('postId requerido')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`)
        if (!res.ok) throw new Error('No se pudo cargar la publicación')
        const json = await res.json()
        const p = (json?.data ?? null) as ApiPost | null
        if (!cancelled) setPost(p)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar'
        if (!cancelled) setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [postId])

  const subject = useMemo(() => 'Tu publicación fue rechazada — Inclusiva', [])
  const previewBody = useMemo(() => {
    const lines: string[] = []
    lines.push('Hola,')
    if (post) {
      lines.push(`Tu publicación "${post.title}" fue rechazada por el equipo de moderación.`)
    } else {
      lines.push('Tu publicación fue rechazada por el equipo de moderación.')
    }
    if (reason) {
      lines.push('Motivo:')
      lines.push(reason)
    }
    lines.push('Podés corregirla y volver a enviarla para revisión.')
    if (postId) {
      lines.push(`Ver publicación: /publicaciones/${postId}`)
    }
    lines.push('Gracias por ser parte de la comunidad Inclusiva.')
    return lines.join('\n')
  }, [post, reason, postId])

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Preview de Email de Moderación</h1>
        <Button variant='outline' onClick={() => router.back()}>Volver</Button>
      </div>
      <Separator className='mb-6' />
      {loading && <div className='text-muted-foreground'>Cargando…</div>}
      {!loading && error && <div className='text-destructive'>{error}</div>}
      {!loading && !error && (
        <Card className='p-4 space-y-4'>
          <div>
            <div className='text-sm text-muted-foreground'>Para</div>
            <div className='text-foreground font-medium'>{to || '(sin email)'}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>Asunto</div>
            <div className='text-foreground font-medium'>{subject}</div>
          </div>
          <Separator />
          <pre className='whitespace-pre-wrap text-sm text-foreground'>{previewBody}</pre>
        </Card>
      )}
    </div>
  )
}
