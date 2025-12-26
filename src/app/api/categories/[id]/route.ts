import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

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
        { error: 'Acesso negado. Apenas administradores podem excluir categorias.' },
        { status: 403 }
      )
    }

    // Verificar se a categoria tem peças associadas
    const partsCount = await prisma.part.count({
      where: { categoryId: params.id }
    })

    if (partsCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir esta categoria. Existem ${partsCount} peças associadas a ela.` },
        { status: 400 }
      )
    }

    // Excluir a categoria
    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    })

  } catch (error) {
    console.error('Delete category error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}