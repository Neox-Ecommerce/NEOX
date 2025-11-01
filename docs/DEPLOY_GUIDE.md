# 🚀 Guia de Deploy - NEOX MVP

## 📋 Visão Geral

Este guia te ajudará a fazer o deploy do seu MVP NEOX (frontend + backend) para produção.

## 🎯 Opções de Deploy Recomendadas

### **Frontend (React + Vite)**
- **Vercel** (Recomendado) - Gratuito, fácil, automático
- **Netlify** - Alternativa gratuita
- **GitHub Pages** - Para projetos públicos

### **Backend (FastAPI + Python)**
- **Railway** (Recomendado) - Gratuito, fácil, com banco
- **Heroku** - Alternativa popular
- **Render** - Alternativa gratuita

## 🚀 Deploy do Backend (Railway)

### 1. Preparar o Backend

```bash
# No diretório do backend
cd C:\Users\jjosi\OneDrive\Desktop\Projetos\Neox-APIs

# Instalar dependências
pip install -r requirements.txt

# Testar localmente
python -m uvicorn app.main:app --port 8000 --host 0.0.0.0
```

### 2. Configurar Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Conecte seu repositório do backend

### 3. Configurar Variáveis de Ambiente

No Railway, vá em "Variables" e adicione:

```env
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:pass@host:port/dbname
APP_NAME=NEOX API
VERSION=1.0.0
DEBUG=False
```

### 4. Deploy

O Railway fará o deploy automaticamente. Anote a URL gerada (ex: `https://neox-api-production.up.railway.app`)

## 🌐 Deploy do Frontend (Vercel)

### 1. Preparar o Frontend

```bash
# No diretório do frontend
cd C:\Users\jjosi\OneDrive\Desktop\Projetos\NEOX

# Instalar dependências
npm install

# Build para produção
npm run build
```

### 2. Configurar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Conecte seu repositório do frontend

### 3. Configurar Variáveis de Ambiente

No Vercel, vá em "Settings" > "Environment Variables" e adicione:

```env
VITE_API_BASE_URL=https://seu-backend-url.railway.app/api/v1
VITE_API_TIMEOUT=10000
VITE_DEBUG_MODE=false
VITE_MOCK_API=false
```

### 4. Deploy

O Vercel fará o deploy automaticamente. Anote a URL gerada (ex: `https://neox-frontend.vercel.app`)

## 🔧 Configurações Adicionais

### CORS no Backend

Atualize o arquivo `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seu-frontend.vercel.app",  # URL do seu frontend
        "http://localhost:5173",  # Para desenvolvimento
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)
```

### Banco de Dados

O Railway oferece PostgreSQL gratuito. Use a URL fornecida na variável `DATABASE_URL`.

## 📱 Testando o MVP

### 1. Teste de Funcionamento

1. Acesse o frontend em produção
2. Teste o registro de usuário
3. Teste o login
4. Teste a criação de loja
5. Teste a criação de produtos
6. Teste a visualização de produtos

### 2. Checklist de MVP

- [ ] ✅ Usuário pode se registrar
- [ ] ✅ Usuário pode fazer login
- [ ] ✅ Empreendedor pode criar loja
- [ ] ✅ Empreendedor pode criar produtos
- [ ] ✅ Cliente pode ver produtos
- [ ] ✅ Cliente pode ver lojas
- [ ] ✅ Sistema de autenticação funcionando
- [ ] ✅ Dados persistindo no banco

## 🎯 Próximos Passos (Pós-MVP)

### Funcionalidades para Adicionar

1. **Carrinho de Compras**
2. **Sistema de Pedidos**
3. **Pagamentos (Stripe/PagSeguro)**
4. **Upload de Imagens**
5. **Sistema de Avaliações**
6. **Notificações**
7. **Dashboard Analytics**

### Melhorias Técnicas

1. **Testes Automatizados**
2. **CI/CD Pipeline**
3. **Monitoramento (Sentry)**
4. **Cache (Redis)**
5. **CDN para Imagens**

## 🆘 Troubleshooting

### Problemas Comuns

1. **CORS Error**
   - Verifique se as URLs estão corretas no CORS
   - Certifique-se que o backend está rodando

2. **Erro de Conexão**
   - Verifique se as variáveis de ambiente estão corretas
   - Teste a URL da API diretamente

3. **Erro de Build**
   - Verifique se todas as dependências estão instaladas
   - Verifique se não há erros de TypeScript

### Logs e Debug

- **Frontend**: Use o console do navegador
- **Backend**: Use os logs do Railway
- **Banco**: Use o dashboard do Railway

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs de erro
2. Teste localmente primeiro
3. Verifique as configurações de ambiente
4. Consulte a documentação das plataformas

## 🎉 Parabéns!

Seu MVP NEOX está no ar! Agora você pode:
- Compartilhar com usuários
- Coletar feedback
- Iterar e melhorar
- Adicionar novas funcionalidades

**URLs do seu MVP:**
- Frontend: `https://seu-frontend.vercel.app`
- Backend: `https://seu-backend.railway.app`
- API Docs: `https://seu-backend.railway.app/docs`



