# 🚀 Comandos para Deploy

## Depois de criar o repositório no GitHub, execute:

```bash
# Substitua SEU-USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU-USUARIO/sistema-auto-pecas.git
git branch -M main
git push -u origin main
```

## Variáveis de Ambiente para Vercel:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

NEXTAUTH_URL=https://sistema-auto-pecas.vercel.app

NEXTAUTH_SECRET=sua-chave-super-secreta-de-pelo-menos-32-caracteres-aqui

JWT_SECRET=outra-chave-secreta-diferente-de-pelo-menos-32-caracteres

NODE_ENV=production
```

## Após Deploy na Vercel:

```bash
# Aplicar schema do banco
npx prisma db push

# Popular com dados iniciais
npx prisma db seed
```

## Login Padrão:
- Email: admin@autopecas.com
- Senha: admin123