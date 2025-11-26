import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })
export const prisma = global.prisma ?? new PrismaClient({ adapter, log: ['warn', 'error'] })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
