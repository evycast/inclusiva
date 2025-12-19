"use client"

import { useQuery } from '@tanstack/react-query'
import type { ListResponse } from '@/types/api'

export type UiSortKey = 'recent' | 'rating'

function mapSort(sort: UiSortKey): string {
  switch (sort) {
    case 'rating':
      return 'rating_desc'
    case 'recent':
    default:
      return 'recent'
  }
}

export function usePostsQuery(params: {
  category?: string | 'all'
  q?: string
  sort?: UiSortKey
  page?: number
  pageSize?: number
  payment?: ('cash'|'debit'|'credit'|'transfer'|'mercadopago'|'crypto')[]
  location?: string
  enabled?: boolean
}) {
  const { category = 'all', q = '', sort = 'recent', page = 1, pageSize = 12, payment, location, enabled = true } = params
  const paymentKey = Array.isArray(payment) && payment.length > 0 ? payment.join(',') : ''
  const sp = new URLSearchParams()
  if (category && category !== 'all') sp.set('category', category)
  if (q) sp.set('q', q)
  if (sort) sp.set('sort', mapSort(sort))
  if (page) sp.set('page', String(page))
  if (pageSize) sp.set('pageSize', String(pageSize))
  if (paymentKey) sp.set('payment', paymentKey)
  if (location && location.trim().length > 0) sp.set('location', location.trim())

  const url = `/api/posts?${sp.toString()}`
  return useQuery<ListResponse>({
    queryKey: ['posts', { category, q, sort, page, pageSize, paymentKey, location }],
    queryFn: async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error fetching posts')
      return res.json() as Promise<ListResponse>
    },
    staleTime: 60_000,
    enabled,
  })
}
