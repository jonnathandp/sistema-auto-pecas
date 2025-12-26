import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    // Import dinâmico do Prisma para evitar problemas no build
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true }
      })

      await prisma.$disconnect()
      return user
    } catch (dbError) {
      await prisma.$disconnect()
      throw dbError
    }
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}