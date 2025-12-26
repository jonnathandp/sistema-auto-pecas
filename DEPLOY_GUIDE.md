# 🚀 Guia Completo de Deploy - Sistema Auto Peças

Este guia te ajudará a fazer o deploy completo do sistema na Vercel com banco Supabase.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Git instalado localmente

## 🗄️ Passo 1: Configurar Banco de Dados no Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Preencha os dados:
   - **Name**: `sistema-auto-pecas`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a região mais próxima (ex: South America)
5. Clique em "Create new project"
6. Aguarde a criação (pode levar alguns minutos)

### 1.2 Obter URL de Conexão

1. No painel do Supabase, vá em **Settings** → **Database**
2. Na seção "Connection string", copie a URL que começa com `postgresql://`
3. Substitua `[YOUR-PASSWORD]` pela senha que você criou
4. A URL final será algo como:
   ```
   postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

## 📁 Passo 2: Subir Código para GitHub

### 2.1 Inicializar Repositório Git

```bash
# No diretório do projeto
cd sistema-auto-pecas

# Inicializar git
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema Auto Peças"
```

### 2.2 Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no "+" no canto superior direito → "New repository"
3. Preencha:
   - **Repository name**: `sistema-auto-pecas`
   - **Description**: `Sistema completo para controle de auto peças`
   - Deixe como **Public** ou **Private** (sua escolha)
   - **NÃO** marque "Add a README file"
4. Clique em "Create repository"

### 2.3 Conectar e Enviar Código

```bash
# Adicionar origem remota (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/sistema-auto-pecas.git

# Enviar código
git branch -M main
git push -u origin main
```

## 🚀 Passo 3: Deploy na Vercel

### 3.1 Conectar GitHub à Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte sua conta do GitHub se ainda não conectou
4. Encontre o repositório `sistema-auto-pecas` e clique em "Import"

### 3.2 Configurar Variáveis de Ambiente

Na tela de configuração do projeto, clique em "Environment Variables" e adicione:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

NEXTAUTH_URL=https://seu-projeto.vercel.app

NEXTAUTH_SECRET=sua-chave-super-secreta-aqui-min-32-chars

JWT_SECRET=outra-chave-secreta-para-jwt-min-32-chars

NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- Substitua a `DATABASE_URL` pela URL do seu Supabase
- Para `NEXTAUTH_SECRET` e `JWT_SECRET`, use chaves aleatórias de pelo menos 32 caracteres
- O `NEXTAUTH_URL` será atualizado após o deploy

### 3.3 Fazer Deploy

1. Clique em "Deploy"
2. Aguarde o build e deploy (pode levar alguns minutos)
3. Após concluído, você receberá uma URL como `https://sistema-auto-pecas-xxx.vercel.app`

### 3.4 Atualizar NEXTAUTH_URL

1. Copie a URL final do seu projeto
2. Volte em **Settings** → **Environment Variables**
3. Edite a variável `NEXTAUTH_URL` com a URL real do seu projeto
4. Clique em "Save"
5. Vá em **Deployments** e clique em "Redeploy" no último deploy

## 🗃️ Passo 4: Configurar Banco de Dados

### 4.1 Aplicar Schema

Após o deploy, você precisa aplicar o schema do banco:

1. No painel da Vercel, vá em **Functions** → **Edge Functions**
2. Ou use a Vercel CLI localmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Conectar ao projeto
vercel link

# Aplicar schema
vercel env pull .env.local
npx prisma db push
```

### 4.2 Popular com Dados Iniciais (Opcional)

```bash
# Executar seed
npx prisma db seed
```

Isso criará:
- Usuário admin: `admin@autopecas.com` / `admin123`
- Categorias de exemplo
- Fornecedores de exemplo
- Peças de exemplo
- Uma venda de exemplo

## ✅ Passo 5: Testar o Sistema

1. Acesse sua URL da Vercel
2. Faça login com:
   - **Email**: `admin@autopecas.com`
   - **Senha**: `admin123`
3. Teste as funcionalidades:
   - Dashboard
   - Cadastro de peças
   - Criação de vendas
   - Gestão de categorias e fornecedores

## 🔧 Configurações Adicionais

### Domínio Customizado (Opcional)

1. No painel da Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure o DNS conforme instruções da Vercel
4. Atualize `NEXTAUTH_URL` com o novo domínio

### Backup do Banco

Configure backups automáticos no Supabase:
1. Vá em **Settings** → **Database**
2. Configure **Point in Time Recovery** se necessário

### Monitoramento

1. Configure alertas no Supabase para uso de recursos
2. Use o painel de analytics da Vercel para monitorar performance

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Testar conexão
npx prisma db push
```
- Verifique se a URL do Supabase está correta
- Confirme se a senha está correta
- Verifique se o projeto Supabase está ativo

### Erro de Build na Vercel
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se não há erros de TypeScript
- Veja os logs detalhados na aba "Functions"

### Erro de Autenticação
- Verifique se `JWT_SECRET` e `NEXTAUTH_SECRET` estão configurados
- Confirme se `NEXTAUTH_URL` está correto
- Limpe cookies do navegador

### Erro 500 em Produção
- Verifique os logs na Vercel
- Confirme se o banco está acessível
- Teste as variáveis de ambiente

## 📱 URLs Importantes

Após o deploy, salve estas URLs:

- **Sistema**: `https://seu-projeto.vercel.app`
- **Supabase Dashboard**: `https://app.supabase.com/project/seu-projeto-id`
- **Vercel Dashboard**: `https://vercel.com/seu-usuario/sistema-auto-pecas`
- **GitHub Repo**: `https://github.com/seu-usuario/sistema-auto-pecas`

## 🔄 Atualizações Futuras

Para atualizar o sistema:

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição da mudança"
git push

# A Vercel fará deploy automático
```

## 🎉 Pronto!

Seu sistema de auto peças está no ar! 🚀

Agora você pode:
- Acessar de qualquer lugar
- Cadastrar peças e fornecedores
- Gerenciar vendas
- Controlar estoque
- Gerar relatórios

---

**💡 Dica**: Salve este guia e as URLs importantes em um local seguro para referência futura.