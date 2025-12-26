import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@autopecas.com' },
    update: {},
    create: {
      email: 'admin@autopecas.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('👤 Usuário admin criado:', adminUser.email)

  // Create categories
  const categories = [
    { name: 'Motor', description: 'Peças relacionadas ao motor do veículo' },
    { name: 'Freios', description: 'Sistema de freios e componentes' },
    { name: 'Suspensão', description: 'Amortecedores, molas e componentes da suspensão' },
    { name: 'Elétrica', description: 'Componentes elétricos e eletrônicos' },
    { name: 'Transmissão', description: 'Câmbio, embreagem e transmissão' },
    { name: 'Carroceria', description: 'Peças da carroceria e acabamento' }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
  }

  console.log('📁 Categorias criadas:', createdCategories.length)

  // Create suppliers
  const suppliers = [
    {
      name: 'AutoPeças Brasil Ltda',
      email: 'contato@autopecasbrasil.com.br',
      phone: '11999887766',
      address: 'Rua das Peças, 123 - São Paulo, SP',
      cnpj: '12345678000195',
      contact: 'João Silva'
    },
    {
      name: 'Distribuidora Central',
      email: 'vendas@distribuidoracentral.com.br',
      phone: '11888776655',
      address: 'Av. Industrial, 456 - São Paulo, SP',
      cnpj: '98765432000187',
      contact: 'Maria Santos'
    },
    {
      name: 'Peças & Cia',
      email: 'info@pecasecia.com.br',
      phone: '11777665544',
      address: 'Rua do Comércio, 789 - São Paulo, SP',
      cnpj: '11223344000156',
      contact: 'Pedro Oliveira'
    }
  ]

  const createdSuppliers = []
  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: { cnpj: supplier.cnpj },
      update: {},
      create: supplier
    })
    createdSuppliers.push(created)
  }

  console.log('🚚 Fornecedores criados:', createdSuppliers.length)

  // Create sample parts
  const parts = [
    {
      code: 'VLV001',
      name: 'Válvula de Admissão',
      description: 'Válvula de admissão para motores 1.0 e 1.4',
      brand: 'Mahle',
      model: 'Gol/Palio',
      year: '2010-2020',
      price: 45.90,
      costPrice: 32.50,
      stock: 25,
      minStock: 5,
      location: 'A1-B2',
      categoryId: createdCategories[0].id,
      supplierId: createdSuppliers[0].id
    },
    {
      code: 'PST001',
      name: 'Pastilha de Freio Dianteira',
      description: 'Pastilha de freio dianteira cerâmica',
      brand: 'Bosch',
      model: 'Civic/Corolla',
      year: '2015-2023',
      price: 89.90,
      costPrice: 65.00,
      stock: 15,
      minStock: 3,
      location: 'B2-C1',
      categoryId: createdCategories[1].id,
      supplierId: createdSuppliers[1].id
    },
    {
      code: 'AMT001',
      name: 'Amortecedor Dianteiro',
      description: 'Amortecedor dianteiro a gás',
      brand: 'Monroe',
      model: 'Uno/Palio',
      year: '2008-2018',
      price: 125.50,
      costPrice: 95.00,
      stock: 8,
      minStock: 2,
      location: 'C1-D3',
      categoryId: createdCategories[2].id,
      supplierId: createdSuppliers[2].id
    },
    {
      code: 'BAT001',
      name: 'Bateria 60Ah',
      description: 'Bateria automotiva 60Ah livre de manutenção',
      brand: 'Moura',
      model: 'Universal',
      year: '2020-2024',
      price: 280.00,
      costPrice: 220.00,
      stock: 12,
      minStock: 3,
      location: 'D1-E2',
      categoryId: createdCategories[3].id,
      supplierId: createdSuppliers[0].id
    },
    {
      code: 'EMB001',
      name: 'Kit Embreagem',
      description: 'Kit embreagem completo com platô, disco e rolamento',
      brand: 'LuK',
      model: 'Gol/Fox',
      year: '2012-2022',
      price: 350.00,
      costPrice: 280.00,
      stock: 6,
      minStock: 2,
      location: 'E1-F1',
      categoryId: createdCategories[4].id,
      supplierId: createdSuppliers[1].id
    }
  ]

  const createdParts = []
  for (const part of parts) {
    const created = await prisma.part.upsert({
      where: { code: part.code },
      update: {},
      create: part
    })
    createdParts.push(created)

    // Create initial stock movement
    await prisma.stockMovement.create({
      data: {
        partId: created.id,
        type: 'IN',
        quantity: part.stock,
        reason: 'Estoque inicial'
      }
    })
  }

  console.log('🔧 Peças criadas:', createdParts.length)

  // Create a sample sale
  const sampleSale = await prisma.sale.create({
    data: {
      saleNumber: '20241226001',
      customerName: 'Cliente Exemplo',
      customerEmail: 'cliente@exemplo.com',
      customerPhone: '11987654321',
      total: 135.80,
      status: 'DELIVERED',
      paymentMethod: 'PIX',
      userId: adminUser.id,
      items: {
        create: [
          {
            partId: createdParts[0].id,
            quantity: 2,
            price: 45.90,
            total: 91.80
          },
          {
            partId: createdParts[1].id,
            quantity: 1,
            price: 44.00,
            total: 44.00
          }
        ]
      }
    }
  })

  // Update stock for sold items
  await prisma.part.update({
    where: { id: createdParts[0].id },
    data: { stock: { decrement: 2 } }
  })

  await prisma.part.update({
    where: { id: createdParts[1].id },
    data: { stock: { decrement: 1 } }
  })

  // Create stock movements for the sale
  await prisma.stockMovement.createMany({
    data: [
      {
        partId: createdParts[0].id,
        type: 'OUT',
        quantity: 2,
        reason: 'Venda',
        reference: sampleSale.saleNumber
      },
      {
        partId: createdParts[1].id,
        type: 'OUT',
        quantity: 1,
        reason: 'Venda',
        reference: sampleSale.saleNumber
      }
    ]
  })

  console.log('💰 Venda exemplo criada:', sampleSale.saleNumber)

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📋 Dados criados:')
  console.log(`- 1 usuário admin (admin@autopecas.com / admin123)`)
  console.log(`- ${createdCategories.length} categorias`)
  console.log(`- ${createdSuppliers.length} fornecedores`)
  console.log(`- ${createdParts.length} peças`)
  console.log(`- 1 venda exemplo`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })