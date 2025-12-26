import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const part = await prisma.part.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        supplier: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!part) {
      return NextResponse.json(
        { error: 'Peça não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: part
    })
  } catch (error) {
    console.error('Get part error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if code already exists (excluding current part)
    if (data.code) {
      const existingPart = await prisma.part.findFirst({
        where: {
          code: data.code,
          id: { not: params.id }
        }
      })

      if (existingPart) {
        return NextResponse.json(
          { error: 'Código da peça já existe' },
          { status: 409 }
        )
      }
    }

    // Get current part to check stock changes
    const currentPart = await prisma.part.findUnique({
      where: { id: params.id }
    })

    if (!currentPart) {
      return NextResponse.json(
        { error: 'Peça não encontrada' },
        { status: 404 }
      )
    }

    const part = await prisma.part.update({
      where: { id: params.id },
      data: {
        ...data,
        price: parseFloat(data.price),
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        weight: data.weight ? parseFloat(data.weight) : null
      },
      include: {
        category: true,
        supplier: true
      }
    })

    // Create stock movement if stock changed
    if (data.stock !== undefined && data.stock !== currentPart.stock) {
      const difference = data.stock - currentPart.stock
      await prisma.stockMovement.create({
        data: {
          partId: part.id,
          type: difference > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(difference),
          reason: 'Ajuste manual de estoque'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: part
    })
  } catch (error) {
    console.error('Update part error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Check if part has sales
    const salesCount = await prisma.saleItem.count({
      where: { partId: params.id }
    })

    if (salesCount > 0) {
      // Don't delete, just deactivate
      const part = await prisma.part.update({
        where: { id: params.id },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Peça desativada (possui vendas associadas)',
        data: part
      })
    }

    await prisma.part.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Peça excluída com sucesso'
    })
  } catch (error) {
    console.error('Delete part error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}