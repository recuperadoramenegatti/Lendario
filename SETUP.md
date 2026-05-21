# 🦊 TOGA · Setup: Google Auth + Cloud Sync

Guia completo para ativar login Google e backup automático.
**Tempo estimado: ~20 minutos.**

---

## PARTE 1 — Supabase (8 min)

### 1.1 · Criar conta e projeto

1. Acesse → **[supabase.com](https://supabase.com)**
2. Clique em **"Start your project"** → faça login com GitHub ou email
3. Clique em **"New project"**
4. Preencha:
   - **Name:** `toga2` (ou qualquer nome)
   - **Database Password:** anote em algum lugar seguro
   - **Region:** escolha a mais próxima do Brasil → `South America (São Paulo)`
5. Clique em **"Create new project"**
6. Aguarde ~2 minutos enquanto o projeto inicializa ☕

---

### 1.2 · Criar a tabela do banco de dados

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (botão no topo)
3. Copie **todo o conteúdo** do arquivo [`supabase-setup.sql`](./supabase-setup.sql) e cole na janela
4. Clique em **"Run"** (botão verde, canto inferior direito)
5. Deve aparecer `Success. No rows returned` ✅

---

### 1.3 · Pegar as credenciais do projeto

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem, lá embaixo)
2. Clique em **"API"**
3. Você vai ver duas informações — **anote/copie ambas:**

```
Project URL:   https://xxxxxxxxxxxx.supabase.co
anon / public: eyJhbGciOiJIUzI1NiIsInR5...  (chave longa)
```

> 💡 A anon key é pública e segura para estar no frontend.

---

## PARTE 2 — Google Cloud Console (8 min)

> Esta é a parte mais burocrática. Siga com calma — tem bastante tela.

### 2.1 · Criar projeto no Google Cloud

1. Acesse → **[console.cloud.google.com](https://console.cloud.google.com)**
2. No topo da página, clique no seletor de projetos (onde diz "My Project" ou similar)
3. Clique em **"New Project"**
4. **Project name:** `toga2-auth` → clique **"Create"**
5. Aguarde alguns segundos e selecione o projeto recém-criado

---

### 2.2 · Ativar a tela de consentimento OAuth

1. No menu lateral esquerdo, vá em **"APIs & Services"** → **"OAuth consent screen"**
2. Selecione **"External"** → clique **"Create"**
3. Preencha apenas o obrigatório:
   - **App name:** `TOGA`
   - **User support email:** seu email
   - **Developer contact information:** seu email
4. Clique **"Save and Continue"** nas próximas 3 telas (Scopes, Test users, Summary)
5. Clique **"Back to Dashboard"**

---

### 2.3 · Criar as credenciais OAuth

1. No menu lateral, vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type:** selecione **"Web application"**
4. **Name:** `TOGA Web`
5. Em **"Authorized redirect URIs"**, clique **"+ Add URI"** e cole:
   ```
   https://SEU_PROJETO_ID.supabase.co/auth/v1/callback
   ```
   > ⚠️ Substitua `SEU_PROJETO_ID` pelo ID do seu projeto Supabase (está na URL do dashboard)

6. Clique **"Create"**
7. Uma janela vai aparecer com:
   ```
   Client ID:      xxxx.apps.googleusercontent.com
   Client Secret:  GOCSPX-xxxxxxxxxxxxxxxxxxxx
   ```
   **Copie os dois** (ou clique "Download JSON") ✅

---

## PARTE 3 — Conectar Google + Supabase (3 min)

### 3.1 · Ativar Google no Supabase

1. Volte ao **[Supabase Dashboard](https://supabase.com/dashboard)**
2. No menu lateral, vá em **"Authentication"** → **"Providers"**
3. Encontre **"Google"** → clique para expandir → ative o toggle
4. Preencha:
   - **Client ID (for OAuth):** o Client ID que você copiou
   - **Client Secret:** o Client Secret que você copiou
5. Clique **"Save"** ✅

---

### 3.2 · Configurar URLs de redirect

1. Ainda em **"Authentication"**, vá em **"URL Configuration"**
2. Preencha:
   - **Site URL:** `https://seu-app.vercel.app`
   - **Redirect URLs:** clique **"Add URL"** e adicione:
     ```
     https://seu-app.vercel.app/*
     ```
     > 💡 Se ainda não tem domínio no Vercel, coloque a URL de preview do PR por enquanto. Pode atualizar depois.
3. Clique **"Save"** ✅

---

## PARTE 4 — Ativar no app (2 min)

Me passe as seguintes informações no chat e eu faço o resto:

```
Project URL:  https://xxxxxxxxxxxx.supabase.co
Anon key:     eyJhbGciOiJIUzI1NiIsInR5...
```

Eu vou:
1. Preencher o `supabase-config.jsx` com suas credenciais
2. Fazer commit + push
3. O Vercel vai fazer deploy automaticamente ✅

---

## Checklist final

- [ ] Projeto Supabase criado
- [ ] SQL executado (tabela `user_sync` criada)
- [ ] Credenciais anotadas (URL + anon key)
- [ ] Projeto Google Cloud criado
- [ ] OAuth consent screen configurado
- [ ] Credenciais OAuth criadas (Client ID + Secret)
- [ ] Google ativado no Supabase com as credenciais
- [ ] Redirect URLs configuradas no Supabase
- [ ] `supabase-config.jsx` preenchido (eu faço por você)
- [ ] Testar login no app ✅

---

## Dúvidas comuns

**"Não encontro o SQL Editor no Supabase"**
→ Menu lateral esquerdo, ícone que parece um terminal `>_`

**"Qual é o ID do meu projeto Supabase?"**
→ Está na URL do dashboard: `supabase.com/dashboard/project/`**`SEU_ID_AQUI`**

**"Posso usar o app sem fazer login?"**
→ Sim! O login é 100% opcional. O app funciona normalmente offline sem nenhuma configuração.

**"Meus dados locais vão ser apagados ao fazer login?"**
→ Não. Na primeira autenticação, seus dados locais são automaticamente migrados para a nuvem. Nada é perdido.

**"Preciso configurar isso em produção e em desenvolvimento?"**
→ Para desenvolvimento local, adicione também `http://localhost:*` nas Redirect URLs do Supabase.
