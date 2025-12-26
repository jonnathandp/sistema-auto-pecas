import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'complete-data-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🚀 Inserindo peças e vendas no PostgreSQL Railway...');

    // 1. Buscar IDs das categorias e fornecedores
    const categories = await prisma.category.findMany();
    const suppliers = await prisma.supplier.findMany();
    const users = await prisma.user.findMany();

    if (categories.length === 0 || suppliers.length === 0) {
      return NextResponse.json({
        error: 'Execute primeiro o endpoint insert-data para criar categorias e fornecedores'
      }, { status: 400 });
    }

    // Mapear por nome para facilitar
    const categoriaMotor = categories.find(c => c.name === 'Motor')?.id;
    const categoriaFreios = categories.find(c => c.name === 'Freios')?.id;
    const categoriaSuspensao = categories.find(c => c.name === 'Suspensão')?.id;
    const categoriaEletrica = categories.find(c => c.name === 'Elétrica')?.id;
    const categoriaCarroceria = categories.find(c => c.name === 'Carroceria')?.id;
    
    const fornecedor1 = suppliers[0]?.id;
    const fornecedor2 = suppliers[1]?.id;
    const fornecedor3 = suppliers[2]?.id;

    const adminUser = users.find(u => u.role === 'ADMIN')?.id;
    const vendedorUser = users.find(u => u.role === 'USER')?.id;

    // 2. Inserir peças usando SQL direto
    const partsData = [
      // Motor
      { code: 'PC001001', name: 'Filtro de Óleo', brand: 'Mann Filter', model: 'W712/75', price: 25.90, cost: 18.50, stock: 50, minStock: 10, category: categoriaMotor, supplier: fornecedor1 },
      { code: 'PC001002', name: 'Vela de Ignição', brand: 'NGK', model: 'BKR6EIX', price: 45.00, cost: 32.00, stock: 30, minStock: 5, category: categoriaMotor, supplier: fornecedor2 },
      { code: 'PC001003', name: 'Correia Dentada', brand: 'Gates', model: 'GT5405', price: 85.00, cost: 58.00, stock: 25, minStock: 4, category: categoriaMotor, supplier: fornecedor1 },
      
      // Freios
      { code: 'PC002001', name: 'Pastilha de Freio', brand: 'Bosch', model: 'BP1234', price: 85.00, cost: 58.00, stock: 40, minStock: 8, category: categoriaFreios, supplier: fornecedor1 },
      { code: 'PC002002', name: 'Disco de Freio', brand: 'Brembo', model: 'BD7890', price: 150.00, cost: 105.00, stock: 25, minStock: 4, category: categoriaFreios, supplier: fornecedor2 },
      { code: 'PC002003', name: 'Fluido de Freio', brand: 'Castrol', model: 'DOT4', price: 35.00, cost: 24.00, stock: 60, minStock: 12, category: categoriaFreios, supplier: fornecedor3 },
      
      // Suspensão
      { code: 'PC003001', name: 'Amortecedor Dianteiro', brand: 'Monroe', model: 'G8005', price: 180.00, cost: 125.00, stock: 20, minStock: 3, category: categoriaSuspensao, supplier: fornecedor2 },
      { code: 'PC003002', name: 'Mola Helicoidal', brand: 'Eibach', model: 'E10-85-016', price: 120.00, cost: 85.00, stock: 15, minStock: 2, category: categoriaSuspensao, supplier: fornecedor3 },
      
      // Elétrica
      { code: 'PC004001', name: 'Bateria 60Ah', brand: 'Moura', model: 'M60GD', price: 280.00, cost: 195.00, stock: 18, minStock: 3, category: categoriaEletrica, supplier: fornecedor1 },
      { code: 'PC004002', name: 'Alternador', brand: 'Bosch', model: 'ALT9090', price: 450.00, cost: 315.00, stock: 12, minStock: 2, category: categoriaEletrica, supplier: fornecedor2 },
      
      // Carroceria
      { code: 'PC005001', name: 'Retrovisor Externo', brand: 'Metagal', model: 'MT123456', price: 95.00, cost: 68.00, stock: 22, minStock: 4, category: categoriaCarroceria, supplier: fornecedor3 },
      { code: 'PC005002', name: 'Farol Dianteiro', brand: 'Arteb', model: 'AR5555', price: 220.00, cost: 154.00, stock: 16, minStock: 3, category: categoriaCarroceria, supplier: fornecedor1 }
    ];

    // Criar peças
    const partIds = [];
    for (const part of partsData) {
      const result = await prisma.$queryRaw<{id: string}[]>`
        INSERT INTO parts (id, code, name, brand, model, price, "costPrice", stock, "minStock", "categoryId", "supplierId", "createdAt", "updatedAt") 
        VALUES (gen_random_uuid(), ${part.code}, ${part.name}, ${part.brand}, ${part.model}, ${part.price}, ${part.cost}, ${part.stock}, ${part.minStock}, ${part.category}, ${part.supplier}, NOW(), NOW())
        ON CONFLICT (code) DO NOTHING
        RETURNING id;
      `;
      if (result.length > 0) {
        partIds.push(result[0].id);
        
        // Criar movimentação de estoque inicial
        await prisma.$executeRaw`
          INSERT INTO stock_movements (id, "partId", type, quantity, reason, "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), ${result[0].id}, 'IN', ${part.stock}, 'Estoque inicial', NOW(), NOW());
        `;
      }
    }

    console.log('✅ Peças inseridas');

    // 3. Criar algumas vendas de exemplo
    if (adminUser && vendedorUser && partIds.length > 0) {
      // Buscar algumas peças criadas
      const createdParts = await prisma.part.findMany({ take: 6 });
      
      if (createdParts.length >= 3) {
        // Venda 1
        const sale1Result = await prisma.$queryRaw<{id: string}[]>`
          INSERT INTO sales (id, "customerName", "customerEmail", "customerPhone", "userId", "totalAmount", status, "paymentMethod", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), 'Carlos Cliente', 'carlos@email.com', '(11) 99999-1234', ${vendedorUser}, 155.90, 'CONFIRMED', 'PIX', NOW(), NOW())
          RETURNING id;
        `;
        
        if (sale1Result.length > 0) {
          const sale1Id = sale1Result[0].id;
          
          // Itens da venda 1
          await prisma.$executeRaw`
            INSERT INTO sale_items (id, "saleId", "partId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt") 
            VALUES 
              (gen_random_uuid(), ${sale1Id}, ${createdParts[0].id}, 2, ${createdParts[0].price}, ${createdParts[0].price * 2}, NOW(), NOW()),
              (gen_random_uuid(), ${sale1Id}, ${createdParts[1].id}, 1, ${createdParts[1].price}, ${createdParts[1].price}, NOW(), NOW());
          `;
          
          // Atualizar estoque
          await prisma.$executeRaw`
            UPDATE parts SET stock = stock - 2 WHERE id = ${createdParts[0].id};
          `;
          await prisma.$executeRaw`
            UPDATE parts SET stock = stock - 1 WHERE id = ${createdParts[1].id};
          `;
        }

        // Venda 2
        const sale2Result = await prisma.$queryRaw<{id: string}[]>`
          INSERT INTO sales (id, "customerName", "customerEmail", "customerPhone", "userId", "totalAmount", status, "paymentMethod", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), 'Maria Motorista', 'maria@email.com', '(11) 88888-5678', ${adminUser}, 330.00, 'DELIVERED', 'CREDIT_CARD', NOW(), NOW())
          RETURNING id;
        `;
        
        if (sale2Result.length > 0) {
          const sale2Id = sale2Result[0].id;
          
          // Itens da venda 2
          await prisma.$executeRaw`
            INSERT INTO sale_items (id, "saleId", "partId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt") 
            VALUES 
              (gen_random_uuid(), ${sale2Id}, ${createdParts[2].id}, 1, ${createdParts[2].price}, ${createdParts[2].price}, NOW(), NOW()),
              (gen_random_uuid(), ${sale2Id}, ${createdParts[3].id}, 1, ${createdParts[3].price}, ${createdParts[3].price}, NOW(), NOW());
          `;
          
          // Atualizar estoque
          await prisma.$executeRaw`
            UPDATE parts SET stock = stock - 1 WHERE id = ${createdParts[2].id};
          `;
          await prisma.$executeRaw`
            UPDATE parts SET stock = stock - 1 WHERE id = ${createdParts[3].id};
          `;
        }
      }
    }

    console.log('✅ Vendas de exemplo criadas');

    // 4. Contar dados finais
    const partsCount = await prisma.part.count();
    const salesCount = await prisma.sale.count();
    const stockMovementsCount = await prisma.stockMovement.count();

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Sistema completo populado com sucesso!',
      data: {
        categories: categories.length,
        suppliers: suppliers.length,
        parts: partsCount,
        sales: salesCount,
        stockMovements: stockMovementsCount,
        users: users.length
      },
      summary: {
        partsCreated: partIds.length,
        salesCreated: 2,
        stockMovements: 'Criadas automaticamente'
      }
    });

  } catch (error) {
    console.error('Complete data error:', error);
    return NextResponse.json({
      error: 'Erro ao inserir dados completos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}