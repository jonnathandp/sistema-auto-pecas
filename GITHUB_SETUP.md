# 📁 Comandos para GitHub

## Depois de criar o repositório no GitHub:

```bash
# Navegar para o diretório
cd sistema-auto-pecas

# Conectar ao repositório (SUBSTITUA pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/sistema-auto-pecas.git

# Renomear branch para main
git branch -M main

# Fazer push inicial
git push -u origin main
```

## Se der erro "remote origin already exists":

```bash
# Remover origem existente
git remote remove origin

# Adicionar novamente com URL correta
git remote add origin https://github.com/SEU-USUARIO/sistema-auto-pecas.git

# Fazer push
git branch -M main
git push -u origin main
```

## Verificar se funcionou:

```bash
git remote -v
```

Deve mostrar:
```
origin  https://github.com/SEU-USUARIO/sistema-auto-pecas.git (fetch)
origin  https://github.com/SEU-USUARIO/sistema-auto-pecas.git (push)
```