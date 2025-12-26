const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Criando usuário admin...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@autopecas.com' },
      update: {},
      create: {
        email: 'admin@autopecas.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@autopecas.com');
    console.log('🔑 Senha: admin123');
    console.log('👤 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();