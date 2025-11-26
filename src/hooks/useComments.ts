import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type CommentItem = {
  id: string
  postId: string
  userId?: string | null
  guestName?: string | null
  parentId?: string | null
  content: string
  status: 'visible' | 'hidden' | 'deleted'
  createdAt: string
  updatedAt: string
}

export function useComments(postId: string) {
  return useQuery<{ data: CommentItem[] }>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return res.json()
    },
  })
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { content: string; guestName?: string; parentId?: string }) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, ...payload }),
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
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
