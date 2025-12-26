# 📁 GUIA: Upload Direto no GitHub

## 🚀 Passo a Passo para Colocar no GitHub

### 1. Baixar o Arquivo ZIP
- Baixe o arquivo `sistema-auto-pecas-completo.zip` que está disponível
- Este arquivo contém todo o código do sistema (sem node_modules)

### 2. Acessar seu Repositório GitHub
- Vá para: https://github.com/jonnathandp/sistema-auto-pecas
- Se o repositório estiver vazio, perfeito!
- Se tiver arquivos, delete todos primeiro

### 3. Upload dos Arquivos
**Opção A - Upload via Interface Web:**
1. Clique em "uploading an existing file"
2. Arraste o arquivo ZIP ou clique "choose your files"
3. Faça upload do `sistema-auto-pecas-completo.zip`
4. Commit message: "Sistema Auto Peças completo"
5. Clique "Commit changes"

**Opção B - Extrair e Upload Individual:**
1. Extraia o ZIP no seu computador
2. No GitHub, clique "uploading an existing file"
3. Arraste TODOS os arquivos e pastas extraídos
4. Commit message: "Sistema Auto Peças completo"
5. Clique "Commit changes"

### 4. Verificar Upload
Após o upload, seu repositório deve ter:
- ✅ package.json
- ✅ src/ (pasta com código)
- ✅ prisma/ (pasta com banco)
- ✅ README.md
- ✅ E todos os outros arquivos

### 5. Próximo Passo: Deploy na Vercel
Após confirmar que todos os arquivos estão no GitHub:
1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. "New Project" → Selecione `jonnathandp/sistema-auto-pecas`
4. Configure as variáveis de ambiente
5. Deploy!

## ⚠️ IMPORTANTE
- NÃO faça upload do arquivo .env (já está excluído)
- NÃO faça upload da pasta node_modules (já está excluída)
- Certifique-se que todos os arquivos foram enviados

## 🎯 Resultado Esperado
Repositório com ~50 arquivos prontos para deploy na Vercel!