import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'seed-database-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    
    const prisma = new PrismaClient();

    // Criar categorias básicas
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Motor' },
        update: {},
        create: { name: 'Motor', description: 'Peças relacionadas ao motor' }
      }),
      prisma.category.upsert({
        where: { name: 'Freios' },
        update: {},
        create: { name: 'Freios', description: 'Sistema de freios' }
      }),
      prisma.category.upsert({
        where: { name: 'Suspensão' },
        update: {},
        create: { name: 'Suspensão', description: 'Componentes de suspensão' }
      })
    ]);

    // Criar fornecedores básicos
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { cnpj: '12.345.678/0001-90' },
        update: {},
        create: {
          name: 'AutoPeças Brasil',
          email: 'vendas@autopecasbrasil.com',
          phone: '(11) 3456-7890',
          cnpj: '12.345.678/0001-90'
        }
      }),
      prisma.supplier.upsert({
        where: { cnpj: '23.456.789/0001-01' },
        update: {},
        create: {
          name: 'Distribuidora Nacional',
          email: 'comercial@dist.com',
          phone: '(21) 2345-6789',
          cnpj: '23.456.789/0001-01'
        }
      })
    ]);

    // Criar usuário vendedor
    const hashedPassword = await bcrypt.hash('123456', 10);
    const vendedor = await prisma.user.upsert({
      where: { email: 'vendedor@autopecas.com' },
      update: {},
      create: {
        email: 'vendedor@autopecas.com',
        name: 'José Vendedor',
        password: hashedPassword,
        role: 'USER'
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Dados básicos criados com sucesso!',
      data: {
        categories: categories.length,
        suppliers: suppliers.length,
        users: 1
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      error: 'Erro ao criar dados',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}