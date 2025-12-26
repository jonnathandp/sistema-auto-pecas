import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'seed-database-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Importar dependências dinamicamente
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    
    const prisma = new PrismaClient();

    console.log('🚀 Iniciando população do banco com dados de teste...');

    // Limpar dados existentes (exceto admin)
    await prisma.stockMovement.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.part.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.category.deleteMany({});

    // 1. Criar categorias
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Motor',
          description: 'Peças relacionadas ao motor do veículo'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Suspensão',
          description: 'Componentes do sistema de suspensão'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Freios',
          description: 'Sistema de freios e componentes'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Transmissão',
          description: 'Caixa de câmbio e transmissão'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Elétrica',
          description: 'Componentes elétricos e eletrônicos'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Carroceria',
          description: 'Peças da carroceria e lataria'
        }
      })
    ]);

    // 2. Criar fornecedores
    const suppliers = await Promise.all([
      prisma.supplier.create({
        data: {
          name: 'AutoPeças Brasil Ltda',
          email: 'vendas@autopecasbrasil.com.br',
          phone: '(11) 3456-7890',
          address: 'Rua das Autopeças, 123 - São Paulo/SP',
          cnpj: '12.345.678/0001-90',
          contact: 'João Silva'
        }
      }),
      prisma.supplier.create({
        data: {
          name: 'Distribuidora Nacional',
          email: 'comercial@distnacional.com.br',
          phone: '(21) 2345-6789',
          address: 'Av. Industrial, 456 - Rio de Janeiro/RJ',
          cnpj: '23.456.789/0001-01',
          contact: 'Maria Santos'
        }
      }),
      prisma.supplier.create({
        data: {
          name: 'Peças Premium',
          email: 'atendimento@pecaspremium.com.br',
          phone: '(11) 4567-8901',
          address: 'Rua Premium, 789 - São Paulo/SP',
          cnpj: '34.567.890/0001-12',
          contact: 'Carlos Lima'
        }
      }),
      prisma.supplier.create({
        data: {
          name: 'Importadora AutoMax',
          email: 'importacao@automax.com.br',
          phone: '(47) 3234-5678',
          address: 'Rua da Importação, 321 - Blumenau/SC',
          cnpj: '45.678.901/0001-23',
          contact: 'Ana Costa'
        }
      })
    ]);

    // 3. Criar peças
    const parts = await Promise.all([
      // Motor
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
      // Suspensão
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
          code: 'PC002002',
          name: 'Mola Helicoidal',
          description: 'Mola helicoidal traseira',
          brand: 'Eibach',
          model: 'E10-85-016-01-22',
          price: 120.00,
          costPrice: 85.00,
          stock: 15,
          minStock: 2,
          location: 'B2-02',
          categoryId: categories[1].id,
          supplierId: suppliers[3].id,
          warranty: 24
        }
      }),
      // Freios
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
          categoryId: categories[2].id,
          supplierId: suppliers[0].id,
          warranty: 12
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC003002',
          name: 'Disco de Freio',
          description: 'Disco de freio ventilado dianteiro',
          brand: 'Brembo',
          model: 'BD7890',
          price: 150.00,
          costPrice: 105.00,
          stock: 25,
          minStock: 4,
          location: 'C1-02',
          categoryId: categories[2].id,
          supplierId: suppliers[1].id,
          warranty: 18
        }
      }),
      // Outros
      prisma.part.create({
        data: {
          code: 'PC004001',
          name: 'Kit Embreagem',
          description: 'Kit completo de embreagem',
          brand: 'LuK',
          model: 'LK624308400',
          price: 350.00,
          costPrice: 245.00,
          stock: 12,
          minStock: 2,
          location: 'D1-01',
          categoryId: categories[3].id,
          supplierId: suppliers[2].id,
          warranty: 24
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC005001',
          name: 'Bateria 60Ah',
          description: 'Bateria automotiva 60Ah',
          brand: 'Moura',
          model: 'M60GD',
          price: 280.00,
          costPrice: 195.00,
          stock: 18,
          minStock: 3,
          location: 'E1-01',
          categoryId: categories[4].id,
          supplierId: suppliers[3].id,
          warranty: 18
        }
      }),
      prisma.part.create({
        data: {
          code: 'PC006001',
          name: 'Retrovisor Externo',
          description: 'Retrovisor externo direito com pisca',
          brand: 'Metagal',
          model: 'MT123456',
          price: 95.00,
          costPrice: 68.00,
          stock: 22,
          minStock: 4,
          location: 'F1-01',
          categoryId: categories[5].id,
          supplierId: suppliers[0].id,
          warranty: 12
        }
      })
    ]);

    // 4. Criar movimentações de estoque iniciais
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

    // 5. Criar usuários de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const vendedor = await prisma.user.create({
      data: {
        email: 'vendedor@autopecas.com',
        name: 'José Vendedor',
        password: hashedPassword,
        role: 'USER'
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Banco de dados populado com sucesso!',
      data: {
        categories: categories.length,
        suppliers: suppliers.length,
        parts: parts.length,
        users: 1,
        stockMovements: parts.length
      },
      testUsers: [
        { email: 'vendedor@autopecas.com', password: '123456', role: 'USER' },
        { email: 'admin@autopecas.com', password: 'admin123', role: 'ADMIN' }
      ]
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      error: 'Erro ao popular banco',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}