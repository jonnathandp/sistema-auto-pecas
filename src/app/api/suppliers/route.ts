import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { parts: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: suppliers
    })
  } catch (error) {
    console.error('Get suppliers error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Check if CNPJ already exists (if provided)
    if (data.cnpj) {
      const existingSupplier = await prisma.supplier.findUnique({
        where: { cnpj: data.cnpj }
      })

      if (existingSupplier) {
        return NextResponse.json(
          { error: 'CNPJ já está cadastrado' },
          { status: 409 }
        )
      }
    }

    const supplier = await prisma.supplier.create({
      data
    })

    return NextResponse.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}