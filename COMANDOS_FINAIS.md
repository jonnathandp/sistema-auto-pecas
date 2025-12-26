# 🚀 COMANDOS FINAIS PARA EXECUTAR NO SEU COMPUTADOR

## 1. Baixar o Código Pronto

Baixe todos os arquivos desta pasta `sistema-auto-pecas` para o seu computador.

## 2. Executar no Terminal (no diretório do projeto):

```bash
# Navegar para o diretório
cd sistema-auto-pecas

# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Sistema Auto Peças completo - pronto para deploy"

# Conectar ao seu repositório GitHub
git remote add origin https://github.com/jonnathandp/sistema-auto-pecas.git

# Renomear branch para main
git branch -M main

# Fazer push (vai pedir login do GitHub)
git push -u origin main
```

## 3. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique "New Project"
4. Selecione `jonnathandp/sistema-auto-pecas`
5. Configure as variáveis de ambiente:

```env
DATABASE_URL=sua-url-do-supabase-aqui

NEXTAUTH_URL=https://sistema-auto-pecas.vercel.app

NEXTAUTH_SECRET=chave-secreta-de-pelo-menos-32-caracteres-aqui

JWT_SECRET=outra-chave-secreta-diferente-de-32-caracteres

NODE_ENV=production
```

6. Clique "Deploy"

## 4. Configurar Banco (após deploy)

```bash
npx prisma db push
npx prisma db seed
```

## 5. Testar Sistema

- URL: https://sistema-auto-pecas.vercel.app (ou a URL que a Vercel gerar)
- Login: admin@autopecas.com
- Senha: admin123

## ✅ Pronto! Sistema online 24/7!