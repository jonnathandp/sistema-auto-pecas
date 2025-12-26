import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get basic stats
    const [totalParts, totalSales, totalRevenue, lowStockParts] = await Promise.all([
      prisma.part.count({ where: { isActive: true } }),
      prisma.sale.count(),
      prisma.sale.aggregate({
        _sum: { total: true }
      }),
      prisma.part.count({
        where: {
          isActive: true,
          stock: { lte: prisma.part.fields.minStock }
        }
      })
    ])

    // Get recent sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            part: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Get top selling parts
    const topSellingParts = await prisma.saleItem.groupBy({
      by: ['partId'],
      _sum: {
        quantity: true,
        total: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    const topSellingPartsWithDetails = await Promise.all(
      topSellingParts.map(async (item) => {
        const part = await prisma.part.findUnique({
          where: { id: item.partId }
        })
        return {
          part,
          totalSold: item._sum.quantity || 0,
          revenue: item._sum.total || 0
        }
      })
    )

    // Get sales by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const salesByMonth = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        total: true
      }
    })

    // Process sales by month data
    const monthlyData = salesByMonth.reduce((acc: any, sale) => {
      const month = new Date(sale.createdAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short'
      })
      
      if (!acc[month]) {
        acc[month] = { sales: 0, revenue: 0 }
      }
      
      acc[month].sales += sale._count.id
      acc[month].revenue += Number(sale._sum.total || 0)
      
      return acc
    }, {})

    const salesByMonthFormatted = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      sales: data.sales,
      revenue: data.revenue
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalParts,
        totalSales,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        lowStockParts,
        recentSales,
        topSellingParts: topSellingPartsWithDetails,
        salesByMonth: salesByMonthFormatted
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}