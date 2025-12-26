# Sistema de Auto Peças

Sistema completo para controle de auto peças desenvolvido com Next.js, TypeScript, Prisma e PostgreSQL.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login/registro com JWT
- **Gestão de Peças**: Cadastro, edição e controle de estoque
- **Vendas e Orçamentos**: Sistema completo de vendas
- **Fornecedores**: Gestão de fornecedores com dados completos
- **Categorias**: Organização de peças por categorias
- **Dashboard**: Visão geral com estatísticas e relatórios
- **Controle de Estoque**: Movimentações e alertas de estoque baixo
- **Relatórios**: Análises de vendas e performance

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT com cookies HTTP-only
- **UI**: Lucide React Icons, componentes customizados
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL (local ou na nuvem)
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd sistema-auto-pecas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/autopecas?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT
JWT_SECRET="your-jwt-secret-here"

# App
NODE_ENV="development"
```

### 4. Configure o banco de dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar as migrações
npm run db:push

# Popular o banco com dados iniciais (opcional)
npm run db:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 👤 Usuário Padrão

Após executar o seed, você pode fazer login com:

- **Email**: admin@autopecas.com
- **Senha**: admin123

## 🚀 Deploy na Vercel

### 1. Prepare o banco de dados

Configure um banco PostgreSQL na nuvem (recomendado: Vercel Postgres, Supabase, ou Railway).

### 2. Configure as variáveis de ambiente na Vercel

No painel da Vercel, adicione as seguintes variáveis:

```env
DATABASE_URL="sua-url-do-postgres"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="sua-chave-secreta"
JWT_SECRET="sua-chave-jwt"
NODE_ENV="production"
```

### 3. Deploy

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer deploy
vercel

# Ou conecte seu repositório GitHub à Vercel
```

### 4. Configure o banco em produção

Após o deploy, execute as migrações:

```bash
# No painel da Vercel ou via CLI
npx prisma db push
npx prisma db seed
```

## 📁 Estrutura do Projeto

```
sistema-auto-pecas/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── parts/          # Gestão de peças
│   │   ├── sales/          # Gestão de vendas
│   │   ├── categories/     # Gestão de categorias
│   │   ├── suppliers/      # Gestão de fornecedores
│   │   └── login/          # Autenticação
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes de UI
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilitários e configurações
│   └── types/             # Tipos TypeScript
├── prisma/                # Schema e migrações
├── public/               # Arquivos estáticos
└── docs/                 # Documentação
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- JWT com cookies HTTP-only
- Validação de dados no frontend e backend
- Proteção contra SQL injection via Prisma
- Sanitização de inputs

## 📊 Funcionalidades Detalhadas

### Dashboard
- Estatísticas gerais (total de peças, vendas, receita)
- Alertas de estoque baixo
- Vendas recentes
- Peças mais vendidas
- Gráficos de vendas por período

### Gestão de Peças
- Cadastro completo com código, nome, marca, modelo
- Controle de estoque com alertas
- Preços de venda e custo
- Localização no estoque
- Categorização e fornecedores
- Histórico de movimentações

### Sistema de Vendas
- Criação de vendas/orçamentos
- Seleção de peças com verificação de estoque
- Cálculo automático de totais
- Diferentes formas de pagamento
- Dados do cliente
- Histórico completo de vendas

### Fornecedores
- Cadastro completo com CNPJ, contatos
- Endereço e dados de contato
- Vinculação com peças
- Histórico de fornecimento

### Categorias
- Organização hierárquica de peças
- Facilita busca e organização
- Relatórios por categoria

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar em produção
npm run lint         # Verificar código
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema ao banco
npm run db:migrate   # Criar migração
npm run db:studio    # Interface visual do banco
npm run db:seed      # Popular banco com dados iniciais
```

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a URL de conexão no `.env`
- Teste a conexão: `npx prisma db push`

### Erro de autenticação
- Verifique se `JWT_SECRET` está configurado
- Limpe cookies do navegador
- Verifique se o usuário existe no banco

### Erro de build
- Execute `npm run db:generate` antes do build
- Verifique se todas as variáveis de ambiente estão configuradas

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

Desenvolvido com ❤️ para facilitar a gestão de auto peças.