import { NextRequest, NextResponse } from 'next/server'

// Força renderização dinâmica
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  // Durante build, sempre retornar erro de serviço indisponível
  if (!process.env.DATABASE_URL || 
      process.env.VERCEL_ENV === 'build' ||
      process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({
      error: 'Service unavailable during build'
    }, { status: 503 })
  }

  try {
    const { verifyPassword, generateToken } = await import('@/lib/auth')
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Import dinâmico do Prisma
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        )
      }

      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        )
      }

      await prisma.$disconnect()

      const token = generateToken(user.id)

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      })

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    } catch (dbError) {
      await prisma.$disconnect()
      throw dbError
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}