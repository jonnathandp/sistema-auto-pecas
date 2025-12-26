# 🚀 Configuração Vercel

## Passo a Passo para Deploy:

### 1. Acesse a Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login com GitHub

### 2. Novo Projeto
- Clique "New Project"
- Selecione "Import Git Repository"
- Escolha `sistema-auto-pecas`

### 3. Configurar Variáveis de Ambiente
Adicione estas variáveis na seção "Environment Variables":

```env
DATABASE_URL
postgresql://postgres.xxxxx:[SUA-SENHA-SUPABASE]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

NEXTAUTH_URL
https://sistema-auto-pecas.vercel.app

NEXTAUTH_SECRET
sua-chave-secreta-de-pelo-menos-32-caracteres-aqui-pode-ser-qualquer-coisa

JWT_SECRET
outra-chave-secreta-diferente-de-32-caracteres-minimo

NODE_ENV
production
```

### 4. Deploy
- Clique "Deploy"
- Aguarde o build (2-3 minutos)

### 5. Configurar Banco (após deploy)
```bash
npx prisma db push
npx prisma db seed
```

### 6. Testar
- Login: admin@autopecas.com
- Senha: admin123