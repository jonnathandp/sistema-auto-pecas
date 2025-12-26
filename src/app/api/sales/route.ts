import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { generateSaleNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { saleNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              part: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.sale.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get sales error:', error)
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

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um item é necessário' },
        { status: 400 }
      )
    }

    // Validate stock availability
    for (const item of data.items) {
      const part = await prisma.part.findUnique({
        where: { id: item.partId }
      })

      if (!part) {
        return NextResponse.json(
          { error: `Peça não encontrada: ${item.partId}` },
          { status: 404 }
        )
      }

      if (part.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para: ${part.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    let total = 0
    const processedItems = []

    for (const item of data.items) {
      const itemTotal = item.quantity * item.price - (item.discount || 0)
      total += itemTotal

      processedItems.push({
        partId: item.partId,
        quantity: item.quantity,
        price: parseFloat(item.price),
        discount: item.discount ? parseFloat(item.discount) : null,
        total: itemTotal
      })
    }

    // Apply sale discount
    if (data.discount) {
      total -= parseFloat(data.discount)
    }

    const saleNumber = generateSaleNumber()

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerDocument: data.customerDocument,
        total,
        discount: data.discount ? parseFloat(data.discount) : null,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        userId: user.id,
        items: {
          create: processedItems
        }
      },
      include: {
        items: {
          include: {
            part: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update stock and create movements
    for (const item of data.items) {
      await prisma.part.update({
        where: { id: item.partId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      await prisma.stockMovement.create({
        data: {
          partId: item.partId,
          type: 'OUT',
          quantity: item.quantity,
          reason: 'Venda',
          reference: sale.saleNumber
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: sale
    })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}