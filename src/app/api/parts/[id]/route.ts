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
    console.log('Dados recebidos para atualização:', data)

    // Basic validation
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

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

    // Remove code from data to prevent unique constraint issues
    const { code, ...updateData } = data

    const part = await prisma.part.update({
      where: { id: params.id },
      data: {
        ...updateData,
        price: parseFloat(updateData.price),
        costPrice: updateData.costPrice ? parseFloat(updateData.costPrice) : null,
        stock: updateData.stock ? parseInt(updateData.stock) : undefined,
        minStock: updateData.minStock ? parseInt(updateData.minStock) : undefined,
        weight: updateData.weight ? parseFloat(updateData.weight) : null,
        warranty: updateData.warranty ? parseInt(updateData.warranty) : null
      },
      include: {
        category: true,
        supplier: true
      }
    })

    // Create stock movement if stock changed
    if (updateData.stock !== undefined) {
      const newStock = parseInt(updateData.stock)
      if (newStock !== currentPart.stock) {
        const difference = newStock - currentPart.stock
        await prisma.stockMovement.create({
          data: {
            partId: part.id,
            type: difference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(difference),
            reason: 'Ajuste manual de estoque'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: part
    })
  } catch (error) {
    console.error('Update part error:', error)
    
    // Handle Prisma specific errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Erro de referência: categoria ou fornecedor inválido' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Código da peça já existe' },
          { status: 409 }
        )
      }
    }
    
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