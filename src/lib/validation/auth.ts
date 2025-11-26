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
  role: z.enum(['user', 'moderator', 'admin']),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  verifiedPublic: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
})
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>
