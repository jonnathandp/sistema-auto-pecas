'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  BarChart3,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total de Peças',
      value: data?.totalParts || 0,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+12%',
      trend: 'up'
    },
    {
      name: 'Total de Vendas',
      value: data?.totalSales || 0,
      icon: ShoppingCart,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: '+8%',
      trend: 'up'
    },
    {
      name: 'Receita Total',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: DollarSign,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100',
      change: '+15%',
      trend: 'up'
    },
    {
      name: 'Estoque Baixo',
      value: data?.lowStockParts || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      change: '-5%',
      trend: 'down'
    }
  ]

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo de volta, {user?.name || 'Usuário'}! 👋
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Aqui está um resumo do seu sistema hoje
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Última atualização: agora</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.name} 
                className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                  <stat.icon className="w-20 h-20 transform rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-800 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      <ShoppingCart className="w-6 h-6 mr-2" />
                      Vendas Recentes
                    </h3>
                    <p className="text-green-100 text-sm">Últimas transações</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="p-6">
                {data?.recentSales && data.recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentSales.map((sale, index) => (
                      <div 
                        key={sale.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {(sale.customerName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {sale.customerName || 'Cliente não informado'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(sale.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
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
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma venda encontrada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Selling Parts */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      <Award className="w-6 h-6 mr-2" />
                      Peças Mais Vendidas
                    </h3>
                    <p className="text-blue-100 text-sm">Top performers</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="p-6">
                {data?.topSellingParts && data.topSellingParts.length > 0 ? (
                  <div className="space-y-4">
                    {data.topSellingParts.map((item, index) => (
                      <div 
                        key={item.part?.id || index} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.part?.name || 'Peça não encontrada'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {item.part?.code}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
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
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma venda encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}