import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Verificar se está em desenvolvimento ou se é um request especial
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Verificação simples de segurança
    if (secret !== 'create-admin-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Importar Prisma dinamicamente
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.upsert({
        where: { email: 'admin@autopecas.com' },
        update: {
          password: hashedPassword,
          role: 'ADMIN'
        },
        create: {
          email: 'admin@autopecas.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        message: 'Usuário admin criado com sucesso!',
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        credentials: {
          email: 'admin@autopecas.com',
          password: 'admin123'
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Erro no banco de dados',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}