import { PrismaClient } from '@prisma/client'

// Função para criar uma nova instância do Prisma
export function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  })
}

// Para uso em desenvolvimento, mantém uma instância global
declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}