import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const supplierId = searchParams.get('supplierId') || ''
    const lowStock = searchParams.get('lowStock') === 'true'
    const inactive = searchParams.get('inactive') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (lowStock) {
      where.stock = { lte: prisma.part.fields.minStock }
    }

    if (!inactive) {
      where.isActive = true
    }

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: {
          category: true,
          supplier: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.part.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: parts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get parts error:', error)
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

    // Generate automatic code based on timestamp and random number
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const autoCode = `PC${timestamp}${random}`

    // Check if auto-generated code already exists (very unlikely)
    let finalCode = autoCode
    let counter = 1
    while (await prisma.part.findUnique({ where: { code: finalCode } })) {
      finalCode = `${autoCode}${counter}`
      counter++
    }

    const part = await prisma.part.create({
      data: {
        ...data,
        code: finalCode,
        price: parseFloat(data.price),
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        weight: data.weight ? parseFloat(data.weight) : null
      },
      include: {
        category: true,
        supplier: true
      }
    })

    // Create initial stock movement
    if (data.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          partId: part.id,
          type: 'IN',
          quantity: data.stock,
          reason: 'Estoque inicial'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: part
    })
  } catch (error) {
    console.error('Create part error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}