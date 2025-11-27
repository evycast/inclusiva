import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50).optional(),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const adminCreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50).optional(),
  phone: z.string().min(6).max(20).optional(),
  dni: z.string().min(6).max(20).optional(),
  role: z.enum(['user', 'moderator', 'admin']),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  verifiedPublic: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
})
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>

export const adminUpdateUserSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  verifiedPublic: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().min(2).max(50).optional(),
  phone: z.string().min(6).max(20).optional(),
  dni: z.string().min(6).max(20).optional(),
})
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>
