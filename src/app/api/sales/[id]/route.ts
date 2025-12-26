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
        { error: 'Acesso negado. Apenas administradores podem excluir vendas.' },
        { status: 403 }
      )
    }

    // Verificar se a venda existe e buscar seus itens
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a venda pode ser excluída (apenas vendas canceladas ou pendentes)
    if (sale.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Não é possível excluir uma venda já entregue. Cancele a venda primeiro.' },
        { status: 400 }
      )
    }

    // Se a venda estiver confirmada, retornar estoque antes de excluir
    if (sale.status === 'CONFIRMED') {
      for (const item of sale.items) {
        await prisma.part.update({
          where: { id: item.partId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })

        // Criar movimentação de estoque
        await prisma.stockMovement.create({
          data: {
            partId: item.partId,
            type: 'IN',
            quantity: item.quantity,
            reason: `Estorno da venda excluída #${sale.saleNumber}`
          }
        })
      }
    }

    // Excluir a venda (os itens são excluídos automaticamente por CASCADE)
    await prisma.sale.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Venda excluída com sucesso',
      stockReturned: sale.status === 'CONFIRMED'
    })

  } catch (error) {
    console.error('Delete sale error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}