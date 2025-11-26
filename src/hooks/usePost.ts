"use client"

import { useQuery } from '@tanstack/react-query'
import type { DetailResponse } from '@/types/api'

export function usePostQuery(id?: string) {
  return useQuery<DetailResponse>({
    queryKey: ['post', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`)
      if (!res.ok) throw new Error('Error fetching post')
      return res.json() as Promise<DetailResponse>
    },
    staleTime: 60_000,
  })
}
