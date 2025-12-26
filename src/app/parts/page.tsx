'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'

interface Part {
  id: string
  code: string
  name: string
  brand?: string
  model?: string
  price: number
  stock: number
  minStock: number
  category: { name: string }
  supplier?: { name: string }
  isActive: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    supplierId: '',
    lowStock: false
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    location: '',
    barcode: '',
    weight: '',
    dimensions: '',
    warranty: '',
    categoryId: '',
    supplierId: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [partsRes, categoriesRes, suppliersRes, userRes] = await Promise.all([
        fetch(`/api/parts?${new URLSearchParams(filters as any)}`),
        fetch('/api/categories'),
        fetch('/api/suppliers'),
        fetch('/api/auth/me')
      ])

      if (partsRes.ok) {
        const partsData = await partsRes.json()
        setParts(partsData.data)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data)
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json()
        setSuppliers(suppliersData.data)
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

    try {
      const url = editingPart ? `/api/parts/${editingPart.id}` : '/api/parts'
      const method = editingPart ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setEditingPart(null)
        resetForm()
        fetchData()
      } else {
        setFormErrors({ general: data.error || 'Erro ao salvar peça' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    }
  }

  const handleEdit = (part: Part) => {
    setEditingPart(part)
    setFormData({
      name: part.name,
      description: '',
      brand: part.brand || '',
      model: part.model || '',
      year: '',
      price: part.price.toString(),
      costPrice: '',
      stock: part.stock.toString(),
      minStock: part.minStock.toString(),
      location: '',
      barcode: '',
      weight: '',
      dimensions: '',
      warranty: '',
      categoryId: part.category ? '' : '',
      supplierId: part.supplier ? '' : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta peça?')) return

    try {
      const response = await fetch(`/api/parts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting part:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      brand: '',
      model: '',
      year: '',
      price: '',
      costPrice: '',
      stock: '',
      minStock: '',
      location: '',
      barcode: '',
      weight: '',
      dimensions: '',
      warranty: '',
      categoryId: '',
      supplierId: ''
    })
    setFormErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Peças</h1>
            <p className="text-gray-600">Gerencie o catálogo de peças</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Peça
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar peças..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            />
            <Select
              options={suppliers.map(sup => ({ value: sup.id, label: sup.name }))}
              value={filters.supplierId}
              onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowStock"
                checked={filters.lowStock}
                onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="lowStock" className="text-sm text-gray-700">
                Estoque baixo
              </label>
            </div>
          </div>
        </div>

        {/* Parts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peça
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map((part) => (
                  <tr key={part.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{part.name}</div>
                          <div className="text-sm text-gray-500">{part.code}</div>
                          {part.brand && (
                            <div className="text-xs text-gray-400">{part.brand} {part.model}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part.category?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(part.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.stock} unidades</div>
                      {part.stock <= part.minStock && (
                        <div className="text-xs text-red-600">Estoque baixo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        part.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {part.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(part)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(part.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingPart(null)
            resetForm()
          }}
          title={editingPart ? 'Editar Peça' : 'Nova Peça'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={formErrors.name}
              />
              <Input
                label="Marca"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
              <Input
                label="Modelo"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
              <Input
                label="Preço"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                error={formErrors.price}
              />
              <Input
                label="Preço de Custo"
                name="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={handleChange}
              />
              <Input
                label="Estoque"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                error={formErrors.stock}
              />
              <Input
                label="Estoque Mínimo"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleChange}
                required
                error={formErrors.minStock}
              />
              <Select
                label="Categoria"
                name="categoryId"
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={formData.categoryId}
                onChange={handleChange}
                required
                error={formErrors.categoryId}
              />
              <Select
                label="Fornecedor"
                name="supplierId"
                options={suppliers.map(sup => ({ value: sup.id, label: sup.name }))}
                value={formData.supplierId}
                onChange={handleChange}
              />
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
                  setEditingPart(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingPart ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}