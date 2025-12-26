const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  // URL baseada na Project URL da imagem
  const newProjectUrl = 'postgresql://postgres:Painosso*2010@db.hbmfhxzodblrsiunsjgt.supabase.co:5432/postgres'
  
  console.log('🔄 Testando novo projeto Supabase...')
  console.log('📝 URL:', newProjectUrl)
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url: newProjectUrl }
    }
  })

  try {
    await prisma.$connect()
    console.log('✅ SUCESSO! Conexão estabelecida!')
    
    // Verificar se banco está vazio (novo)
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    console.log(`📋 Tabelas encontradas: ${result.length}`)
    
    if (result.length === 0) {
      console.log('🆕 Banco novo - pronto para usar!')
    }
    
    await prisma.$disconnect()
    console.log('\n🎉 URL CORRETA PARA USAR:')
    console.log(newProjectUrl)
    
  } catch (error) {
    console.log('❌ Ainda não está pronto:', error.message)
    console.log('⏳ Aguarde mais alguns minutos e tente novamente')
  }
}

testDatabase()

testDatabase()