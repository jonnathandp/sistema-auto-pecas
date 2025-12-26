import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'insert-data-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    
    const prisma = new PrismaClient();
    
    console.log('🚀 Inserindo dados no PostgreSQL Railway...');

    // 1. Inserir categorias usando SQL direto
    await prisma.$executeRaw`
      INSERT INTO categories (id, name, description, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'Motor', 'Peças relacionadas ao motor do veículo', NOW(), NOW()),
        (gen_random_uuid(), 'Freios', 'Sistema de freios e componentes', NOW(), NOW()),
        (gen_random_uuid(), 'Suspensão', 'Componentes do sistema de suspensão', NOW(), NOW()),
        (gen_random_uuid(), 'Transmissão', 'Caixa de câmbio e transmissão', NOW(), NOW()),
        (gen_random_uuid(), 'Elétrica', 'Componentes elétricos e eletrônicos', NOW(), NOW()),
        (gen_random_uuid(), 'Carroceria', 'Peças da carroceria e lataria', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `;

    console.log('✅ Categorias inseridas');

    // 2. Inserir fornecedores
    await prisma.$executeRaw`
      INSERT INTO suppliers (id, name, email, phone, address, cnpj, contact, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'AutoPeças Brasil Ltda', 'vendas@autopecasbrasil.com.br', '(11) 3456-7890', 'Rua das Autopeças, 123 - São Paulo/SP', '12.345.678/0001-90', 'João Silva', NOW(), NOW()),
        (gen_random_uuid(), 'Distribuidora Nacional', 'comercial@distnacional.com.br', '(21) 2345-6789', 'Av. Industrial, 456 - Rio de Janeiro/RJ', '23.456.789/0001-01', 'Maria Santos', NOW(), NOW()),
        (gen_random_uuid(), 'Peças Premium', 'atendimento@pecaspremium.com.br', '(11) 4567-8901', 'Rua Premium, 789 - São Paulo/SP', '34.567.890/0001-12', 'Carlos Lima', NOW(), NOW())
      ON CONFLICT (cnpj) DO NOTHING;
    `;

    console.log('✅ Fornecedores inseridos');

    // 3. Inserir usuário vendedor
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await prisma.$executeRaw`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'vendedor@autopecas.com', 'José Vendedor', ${hashedPassword}, 'USER', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `;

    console.log('✅ Usuário vendedor inserido');

    // 4. Buscar dados inseridos para confirmar
    const categoriesCount = await prisma.category.count();
    const suppliersCount = await prisma.supplier.count();
    const usersCount = await prisma.user.count();

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Dados inseridos com sucesso no PostgreSQL Railway!',
      data: {
        categories: categoriesCount,
        suppliers: suppliersCount,
        users: usersCount
      },
      insertedData: {
        categories: 6,
        suppliers: 3,
        testUser: 1
      },
      testCredentials: {
        admin: { email: 'admin@autopecas.com', password: 'admin123' },
        vendedor: { email: 'vendedor@autopecas.com', password: '123456' }
      }
    });

  } catch (error) {
    console.error('Insert error:', error);
    return NextResponse.json({
      error: 'Erro ao inserir dados',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}