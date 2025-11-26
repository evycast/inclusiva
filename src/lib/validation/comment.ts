import { z } from 'zod'

export const commentCreateSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(3).max(500),
  guestName: z.string().min(2).max(50).optional(),
  parentId: z.string().min(1).optional(),
})

export type CommentCreateInput = z.infer<typeof commentCreateSchema>

export const commentModerateSchema = z.object({
  status: z.enum(['hidden', 'deleted']),
  reason: z.string().min(2).max(300).optional(),
})

export type CommentModerateInput = z.infer<typeof commentModerateSchema>
