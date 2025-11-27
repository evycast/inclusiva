export type ApiPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

import type { PostInput } from '@/lib/validation/post'
import { categoryOptions, paymentMethodOptions } from '@/lib/validation/post'

export type Category = typeof categoryOptions[number]
export type PaymentMethod = typeof paymentMethodOptions[number]

// API Post se basa en el PostInput del schema y asegura id presente
export type ApiPost = PostInput & { id: string }

export type ListResponse = { data: ApiPost[]; pagination: ApiPagination }
export type DetailResponse = { data: ApiPost }

export type UserRole = 'user' | 'moderator' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected'
export type ApiUser = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  dni?: string | null
  role: UserRole
  status: UserStatus
  emailVerified?: string | null
  verifiedPublic: boolean
  createdAt: string
  updatedAt: string
}
export type UsersListResponse = { data: ApiUser[]; pagination: ApiPagination }
