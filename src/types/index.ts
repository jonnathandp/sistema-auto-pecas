import { Prisma } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// NextAuth types extension
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

// User types
export type User = Prisma.UserGetPayload<{}>
export type UserWithSales = Prisma.UserGetPayload<{
  include: { sales: true }
}>

// Part types
export type Part = Prisma.PartGetPayload<{}>
export type PartWithCategory = Prisma.PartGetPayload<{
  include: { category: true; supplier: true }
}>
export type PartWithRelations = Prisma.PartGetPayload<{
  include: { 
    category: true
    supplier: true
    saleItems: true
    stockMovements: true
  }
}>

// Sale types
export type Sale = Prisma.SaleGetPayload<{}>
export type SaleWithItems = Prisma.SaleGetPayload<{
  include: { 
    items: {
      include: {
        part: true
      }
    }
    user: true
  }
}>

// Category types
export type Category = Prisma.CategoryGetPayload<{}>
export type CategoryWithParts = Prisma.CategoryGetPayload<{
  include: { parts: true }
}>

// Supplier types
export type Supplier = Prisma.SupplierGetPayload<{}>
export type SupplierWithParts = Prisma.SupplierGetPayload<{
  include: { parts: true }
}>

// Stock Movement types
export type StockMovement = Prisma.StockMovementGetPayload<{}>
export type StockMovementWithPart = Prisma.StockMovementGetPayload<{
  include: { part: true }
}>

// Sale Item types
export type SaleItem = Prisma.SaleItemGetPayload<{}>
export type SaleItemWithPart = Prisma.SaleItemGetPayload<{
  include: { part: true }
}>

// Form types
export interface PartFormData {
  code: string
  name: string
  description?: string
  brand?: string
  model?: string
  year?: string
  price: number
  costPrice?: number
  stock: number
  minStock: number
  location?: string
  barcode?: string
  weight?: number
  dimensions?: string
  warranty?: number
  categoryId: string
  supplierId?: string
}

export interface SaleFormData {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerDocument?: string
  discount?: number
  paymentMethod?: string
  notes?: string
  items: {
    partId: string
    quantity: number
    price: number
    discount?: number
  }[]
}

export interface CategoryFormData {
  name: string
  description?: string
}

export interface SupplierFormData {
  name: string
  email?: string
  phone?: string
  address?: string
  cnpj?: string
  contact?: string
}

// Dashboard types
export interface DashboardStats {
  totalParts: number
  totalSales: number
  totalRevenue: number
  lowStockParts: number
  recentSales: SaleWithItems[]
  topSellingParts: Array<{
    part: Part
    totalSold: number
    revenue: number
  }>
  salesByMonth: Array<{
    month: string
    sales: number
    revenue: number
  }>
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter types
export interface PartFilters {
  search?: string
  categoryId?: string
  supplierId?: string
  lowStock?: boolean
  inactive?: boolean
}

export interface SaleFilters {
  search?: string
  status?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}