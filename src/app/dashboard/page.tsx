'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react'

interface DashboardData {
  totalParts: number
  totalSales: number
  totalRevenue: number
  lowStockParts: number
  recentSales: any[]
  topSellingParts: any[]
  salesByMonth: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, userRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/auth/me')
        ])

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json()
          setData(dashboardData.data)
        }

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total de Peças',
      value: data?.totalParts || 0,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      name: 'Total de Vendas',
      value: data?.totalSales || 0,
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      name: 'Receita Total',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'Estoque Baixo',
      value: data?.lowStockParts || 0,
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ]

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
            </div>
            <div className="p-6">
              {data?.recentSales && data.recentSales.length > 0 ? (
                <div className="space-y-4">
                  {data.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {sale.customerName || 'Cliente não informado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(Number(sale.total))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.items?.length || 0} itens
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma venda encontrada
                </p>
              )}
            </div>
          </div>

          {/* Top Selling Parts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Peças Mais Vendidas</h3>
            </div>
            <div className="p-6">
              {data?.topSellingParts && data.topSellingParts.length > 0 ? (
                <div className="space-y-4">
                  {data.topSellingParts.map((item, index) => (
                    <div key={item.part?.id || index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.part?.name || 'Peça não encontrada'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.part?.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.totalSold} vendidas
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(Number(item.revenue))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma venda encontrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}