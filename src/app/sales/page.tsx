'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDateTime, getStatusColor, getStatusText, getPaymentMethodText } from '@/lib/utils'
import { Plus, Search, Eye, ShoppingCart, Trash2 } from 'lucide-react'

interface Sale {
  id: string
  saleNumber: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  total: number
  status: string
  paymentMethod?: string
  createdAt: string
  items: SaleItem[]
  user: { name: string }
}

interface SaleItem {
  id: string
  quantity: number
  price: number
  total: number
  part: {
    id: string
    name: string
    code: string
    stock: number
  }
}

interface Part {
  id: string
  code: string
  name: string
  price: number
  stock: number
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: ''
  })
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerDocument: '',
    discount: '',
    paymentMethod: '',
    notes: '',
    items: [] as Array<{
      partId: string
      quantity: number
      price: number
      discount?: number
    }>
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [selectedPart, setSelectedPart] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemPrice, setItemPrice] = useState('')

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [salesRes, partsRes, userRes] = await Promise.all([
        fetch(`/api/sales?${new URLSearchParams(filters as any)}`),
        fetch('/api/parts?limit=1000'),
        fetch('/api/auth/me')
      ])

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSales(salesData.data)
      }

      if (partsRes.ok) {
        const partsData = await partsRes.json()
        setParts(partsData.data.filter((part: Part) => part.stock > 0))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    if (formData.items.length === 0) {
      setFormErrors({ general: 'Adicione pelo menos um item à venda' })
      return
    }

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        resetForm()
        fetchData()
      } else {
        setFormErrors({ general: data.error || 'Erro ao criar venda' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    }
  }

  const addItem = () => {
    if (!selectedPart || !itemPrice) return

    const part = parts.find(p => p.id === selectedPart)
    if (!part) return

    if (itemQuantity > part.stock) {
      setFormErrors({ item: 'Quantidade maior que o estoque disponível' })
      return
    }

    const newItem = {
      partId: selectedPart,
      quantity: itemQuantity,
      price: parseFloat(itemPrice),
      discount: 0
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setSelectedPart('')
    setItemQuantity(1)
    setItemPrice('')
    setFormErrors({})
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price - (item.discount || 0))
    }, 0)
    
    const discount = parseFloat(formData.discount) || 0
    return itemsTotal - discount
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerDocument: '',
      discount: '',
      paymentMethod: '',
      notes: '',
      items: []
    })
    setFormErrors({})
    setSelectedPart('')
    setItemQuantity(1)
    setItemPrice('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale)
    setShowViewModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'BANK_TRANSFER', label: 'Transferência' },
    { value: 'CHECK', label: 'Cheque' }
  ]

  const statusOptions = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'DELIVERED', label: 'Entregue' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ]

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600">Gerencie as vendas e orçamentos</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar vendas..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
            <Select
              options={paymentMethods}
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{sale.saleNumber}</div>
                          <div className="text-sm text-gray-500">{sale.items.length} itens</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.customerName || 'Cliente não informado'}
                      </div>
                      {sale.customerPhone && (
                        <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(sale.total))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSale(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Sale Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title="Nova Venda"
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                />
                <Input
                  label="Telefone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
                <Input
                  label="CPF/CNPJ"
                  name="customerDocument"
                  value={formData.customerDocument}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Itens da Venda</h3>
              
              {/* Add Item */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    label="Peça"
                    options={parts.map(part => ({ 
                      value: part.id, 
                      label: `${part.name} (${part.code}) - Estoque: ${part.stock}` 
                    }))}
                    value={selectedPart}
                    onChange={(e) => {
                      setSelectedPart(e.target.value)
                      const part = parts.find(p => p.id === e.target.value)
                      if (part) {
                        setItemPrice(part.price.toString())
                      }
                    }}
                  />
                  <Input
                    label="Quantidade"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                  />
                  <Input
                    label="Preço"
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </div>
                {formErrors.item && (
                  <p className="text-red-600 text-sm mt-2">{formErrors.item}</p>
                )}
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Peça
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qtd
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Preço
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => {
                        const part = parts.find(p => p.id === item.partId)
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {part?.name} ({part?.code})
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Desconto"
                  name="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleChange}
                />
                <Select
                  label="Forma de Pagamento"
                  name="paymentMethod"
                  options={paymentMethods}
                  value={formData.paymentMethod}
                  onChange={handleChange}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Observações"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Total: {formatCurrency(calculateTotal())}
                </p>
              </div>
            </div>

            {formErrors.general && (
              <div className="text-red-600 text-sm">{formErrors.general}</div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Criar Venda
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Sale Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setViewingSale(null)
          }}
          title={`Venda #${viewingSale?.saleNumber}`}
          size="lg"
        >
          {viewingSale && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Dados do Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nome:</span> {viewingSale.customerName || 'Não informado'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {viewingSale.customerEmail || 'Não informado'}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {viewingSale.customerPhone || 'Não informado'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingSale.status)}`}>
                      {getStatusText(viewingSale.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Itens</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Peça
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qtd
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Preço
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingSale.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.part.name} ({item.part.code})
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(Number(item.price))}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(Number(item.total))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Forma de Pagamento:</span>{' '}
                    {viewingSale.paymentMethod ? getPaymentMethodText(viewingSale.paymentMethod) : 'Não informado'}
                  </div>
                  <div>
                    <span className="font-medium">Data:</span> {formatDateTime(viewingSale.createdAt)}
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Total: {formatCurrency(Number(viewingSale.total))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}