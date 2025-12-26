import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { isBuildTime } from '@/lib/build-utils'

// Força renderização dinâmica
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Configuração idêntica ao NextAuth para consistência
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (process.env.VERCEL_ENV === 'build' || !process.env.DATABASE_URL) {
          return null
        }

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const bcrypt = await import('bcryptjs')
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            await prisma.$disconnect()
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          await prisma.$disconnect()

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
    ...(process.env.GITHUB_ID ? [GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET!,
    })] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
}

export async function GET(request: NextRequest) {
  try {
    // Verificação robusta de build time
    if (isBuildTime()) {
      return NextResponse.json({
        error: 'Service unavailable during build'
      }, { status: 503 })
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: session.user
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}