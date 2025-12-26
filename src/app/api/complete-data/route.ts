import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'complete-data-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🚀 Inserindo dados completos...');

    // Buscar categorias e fornecedores existentes
    const categories = await prisma.category.findMany();
    const suppliers = await prisma.supplier.findMany();
    
    if (categories.length === 0 || suppliers.length === 0) {
      return NextResponse.json({
        error: 'Execute primeiro o endpoint insert-data para criar categorias e fornecedores'
      }, { status: 400 });
    }

    // Inserir peças usando Prisma create (mais seguro)
    const parts = await Promise.all([
      prisma.part.create({
        data: {
          code: 'PC001001',
          name: 'Filtro de Óleo',
          description: 'Filtro de óleo para motores 1.0 a 2.0',
          brand: 'Mann Filter',
          model: 'W712/75',
          price: 25.90,
          costPrice: 18.50,
          stock: 50,
          minStock: 10,
          location: 'A1-01',
          categoryId: categories[0].id,
          supplierId: suppliers[0].id,
          warranty: 12
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC001002',
          name: 'Vela de Ignição',
          description: 'Vela de ignição iridium',
          brand: 'NGK',
          model: 'BKR6EIX',
          price: 45.00,
          costPrice: 32.00,
          stock: 30,
          minStock: 5,
          location: 'A1-02',
          categoryId: categories[0].id,
          supplierId: suppliers[1].id,
          warranty: 24
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC002001',
          name: 'Amortecedor Dianteiro',
          description: 'Amortecedor dianteiro direito',
          brand: 'Monroe',
          model: 'G8005',
          price: 180.00,
          costPrice: 125.00,
          stock: 20,
          minStock: 3,
          location: 'B2-01',
          categoryId: categories[1].id,
          supplierId: suppliers[2].id,
          warranty: 12
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC003001',
          name: 'Pastilha de Freio',
          description: 'Pastilha de freio dianteira',
          brand: 'Bosch',
          model: 'BP1234',
          price: 85.00,
          costPrice: 58.00,
          stock: 40,
          minStock: 8,
          location: 'C1-01',
          categoryId: categories[1].id,
          supplierId: suppliers[0].id,
          warranty: 12
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC004001',
          name: 'Bateria 60Ah',
          description: 'Bateria automotiva 60Ah',
          brand: 'Moura',
          model: 'M60GD',
          price: 280.00,
          costPrice: 195.00,
          stock: 18,
          minStock: 3,
          location: 'E1-01',
          categoryId: categories[2].id,
          supplierId: suppliers[1].id,
          warranty: 18
        }
      })
    ]);

    console.log('✅ Peças criadas');

    // Buscar usuários para vendas
    const vendedor = await prisma.user.findUnique({
      where: { email: 'vendedor@autopecas.com' }
    });
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@autopecas.com' }
    });

    let salesCount = 0;

    if (vendedor && parts.length >= 3) {
      // Criar venda 1
      const sale1 = await prisma.sale.create({
        data: {
          saleNumber: 'SALE-001',
          customerName: 'Carlos Cliente',
          customerEmail: 'carlos@email.com',
          customerPhone: '(11) 99999-1234',
          userId: vendedor.id,
          total: 155.90,
          status: 'CONFIRMED',
          paymentMethod: 'PIX'
        }
      });

      // Itens da venda 1
      await Promise.all([
        prisma.saleItem.create({
          data: {
            saleId: sale1.id,
            partId: parts[0].id,
            quantity: 2,
            unitPrice: 25.90,
            totalPrice: 51.80
          }
        }),
        prisma.saleItem.create({
          data: {
            saleId: sale1.id,
            partId: parts[3].id,
            quantity: 1,
            unitPrice: 85.00,
            totalPrice: 85.00
          }
        })
      ]);

      salesCount++;
    }

    if (admin && parts.length >= 3) {
      // Criar venda 2
      const sale2 = await prisma.sale.create({
        data: {
          saleNumber: 'SALE-002',
          customerName: 'Maria Motorista',
          customerEmail: 'maria@email.com',
          customerPhone: '(11) 88888-5678',
          userId: admin.id,
          total: 460.00,
          status: 'DELIVERED',
          paymentMethod: 'CREDIT_CARD'
        }
      });

      // Itens da venda 2
      await Promise.all([
        prisma.saleItem.create({
          data: {
            saleId: sale2.id,
            partId: parts[2].id,
            quantity: 1,
            unitPrice: 180.00,
            totalPrice: 180.00
          }
        }),
        prisma.saleItem.create({
          data: {
            saleId: sale2.id,
            partId: parts[4].id,
            quantity: 1,
            unitPrice: 280.00,
            totalPrice: 280.00
          }
        })
      ]);

      salesCount++;
    }

    console.log('✅ Vendas criadas');

    // Criar movimentações de estoque
    for (const part of parts) {
      await prisma.stockMovement.create({
        data: {
          partId: part.id,
          type: 'IN',
          quantity: part.stock,
          reason: 'Estoque inicial'
        }
      });
    }

    console.log('✅ Movimentações de estoque criadas');

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Dados completos inseridos com sucesso!',
      data: {
        parts: parts.length,
        sales: salesCount,
        stockMovements: parts.length
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