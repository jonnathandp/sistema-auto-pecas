'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  _count: {
    parts: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, userRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/auth/me')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data)
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
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

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
        setEditingCategory(null)
        resetForm()
        fetchData()
      } else {
        setFormErrors({ general: data.error || 'Erro ao salvar categoria' })
      }
    } catch (error) {
      setFormErrors({ general: 'Erro de conexão' })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
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
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600">Organize suas peças por categorias</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Folder className="w-8 h-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category._count.parts} peças
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      disabled={category._count.parts > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}
                
                <div className="text-xs text-gray-500">
                  Criado em {formatDate(category.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira categoria de peças.</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Categoria
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingCategory(null)
            resetForm()
          }}
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              error={formErrors.name}
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Descrição da categoria (opcional)"
              />
              {formErrors.description && (
                <p className="text-sm text-red-600">{formErrors.description}</p>
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
                  setEditingCategory(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}