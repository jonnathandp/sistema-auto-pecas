'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatCNPJ, formatPhone } from '@/lib/utils'
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  cnpj?: string
  contact?: string
  createdAt: string
  _count: {
    parts: number
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnpj: '',
    contact: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [suppliersRes, userRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/auth/me')
      ])

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
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers'
      const method = editingSupplier ? 'PUT' : 'POST'

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
        setEditingSupplier(null)
        resetForm()
        fetchData()
      } else {
        setFormErrors({ general: data.error || 'Erro ao salvar fornecedor' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      cnpj: supplier.cnpj || '',
      contact: supplier.contact || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cnpj: '',
      contact: ''
    })
    setFormErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600">Gerencie seus fornecedores de peças</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Truck className="w-8 h-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-500">
                        {supplier._count.parts} peças
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                      disabled={supplier._count.parts > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {supplier.email}
                    </div>
                  )}
                  
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {formatPhone(supplier.phone)}
                    </div>
                  )}
                  
                  {supplier.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {supplier.address}
                    </div>
                  )}
                  
                  {supplier.cnpj && (
                    <div className="text-sm text-gray-600">
                      CNPJ: {formatCNPJ(supplier.cnpj)}
                    </div>
                  )}
                  
                  {supplier.contact && (
                    <div className="text-sm text-gray-600">
                      Contato: {supplier.contact}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  Criado em {formatDate(supplier.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {suppliers.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-600 mb-4">Comece cadastrando seu primeiro fornecedor.</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Fornecedor
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingSupplier(null)
            resetForm()
          }}
          title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                error={formErrors.cnpj}
                helperText="Apenas números"
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
              />
              
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
              />
              
              <Input
                label="Contato"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                error={formErrors.contact}
                helperText="Nome da pessoa de contato"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Endereço completo do fornecedor"
              />
              {formErrors.address && (
                <p className="text-sm text-red-600">{formErrors.address}</p>
              )}
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
                  setEditingSupplier(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingSupplier ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}