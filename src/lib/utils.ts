import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function generateSaleNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = String(now.getTime()).slice(-6)
  
  return `${year}${month}${day}${time}`
}

export function calculateDiscount(price: number, discount: number): number {
  return price - (price * discount / 100)
}

export function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  
  if (cnpj.length !== 14) return false
  
  // Validate check digits
  let sum = 0
  let weight = 2
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(cnpj.charAt(12)) !== digit) return false
  
  sum = 0
  weight = 2
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return parseInt(cnpj.charAt(13)) === digit
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '')
  
  if (cpf.length !== 11) return false
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(cpf.charAt(9)) !== digit) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return parseInt(cpf.charAt(10)) === digit
}

export function formatCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/[^\d]/g, '')
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '')
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, '')
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }
  return phone
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente'
    case 'CONFIRMED':
      return 'Confirmado'
    case 'DELIVERED':
      return 'Entregue'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return status
  }
}

export function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Dinheiro'
    case 'CREDIT_CARD':
      return 'Cartão de Crédito'
    case 'DEBIT_CARD':
      return 'Cartão de Débito'
    case 'PIX':
      return 'PIX'
    case 'BANK_TRANSFER':
      return 'Transferência'
    case 'CHECK':
      return 'Cheque'
    default:
      return method
  }
}