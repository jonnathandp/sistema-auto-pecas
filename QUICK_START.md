# ⚡ Quick Start - Sistema Auto Peças

## 🚀 Começar Rapidamente

### 1. Clone e Configure (5 minutos)

```bash
# Clone o projeto
git clone <url-do-seu-repositorio>
cd sistema-auto-pecas

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite o .env com suas configurações
```

### 2. Configure Supabase (3 minutos)

1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto: `sistema-auto-pecas`
3. Copie a URL do banco em Settings → Database
4. Cole no `.env` na variável `DATABASE_URL`

### 3. Configure o Banco (2 minutos)

```bash
# Aplicar schema
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 4. Execute o Sistema (1 minuto)

```bash
npm run dev
```

Acesse: `http://localhost:3000`

**Login padrão:**
- Email: `admin@autopecas.com`
- Senha: `admin123`

## 🌐 Deploy Rápido na Vercel

### 1. GitHub (2 minutos)
```bash
git add .
git commit -m "Sistema Auto Peças"
git push origin main
```

### 2. Vercel (3 minutos)
1. Acesse [vercel.com](https://vercel.com)
2. Import do GitHub
3. Configure variáveis de ambiente:
   - `DATABASE_URL` (do Supabase)
   - `NEXTAUTH_SECRET` (chave aleatória)
   - `JWT_SECRET` (chave aleatória)
   - `NEXTAUTH_URL` (URL da Vercel)
   - `NODE_ENV=production`

### 3. Finalizar (1 minuto)
```bash
# Aplicar banco em produção
npx prisma db push
npx prisma db seed
```

## ✅ Pronto!

Seu sistema está no ar em menos de 15 minutos! 🎉

**Próximos passos:**
- Customize as categorias
- Cadastre seus fornecedores
- Adicione suas peças
- Comece a vender!

---

**💡 Precisa de ajuda?** Veja o `DEPLOY_GUIDE.md` para instruções detalhadas.