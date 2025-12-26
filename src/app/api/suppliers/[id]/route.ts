import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

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

    // Verificar se já existe outro fornecedor com o mesmo CNPJ (se fornecido)
    if (data.cnpj) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          cnpj: data.cnpj,
          NOT: { id: params.id }
        }
      })

      if (existingSupplier) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor com este CNPJ' },
          { status: 409 }
        )
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cnpj: data.cnpj,
        contact: data.contact
      },
      include: {
        _count: {
          select: { parts: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedSupplier
    })

  } catch (error) {
    console.error('Update supplier error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      )
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
        { error: 'Acesso negado. Apenas administradores podem excluir fornecedores.' },
        { status: 403 }
      )
    }

    // Verificar se o fornecedor tem peças associadas
    const partsCount = await prisma.part.count({
      where: { supplierId: params.id }
    })

    if (partsCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir este fornecedor. Existem ${partsCount} peças associadas a ele.` },
        { status: 400 }
      )
    }

    // Excluir o fornecedor
    await prisma.supplier.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Fornecedor excluído com sucesso'
    })

  } catch (error) {
    console.error('Delete supplier error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}