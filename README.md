# 💬 ChatPad - Chat em Tempo Real

Uma aplicação de chat simples e anônima, inspirada no Dontpad, hospedada no GitHub Pages com Firebase Realtime Database.

## 🚀 Como usar

1. Acesse o site
2. Crie uma nova sala com um nome personalizado OU entre em uma sala existente
3. Compartilhe a URL com outras pessoas
4. Comecem a conversar em tempo real de forma anônima!

## 🔒 Segurança

Este projeto implementa várias camadas de segurança:

- ✅ Configuração Firebase em variáveis de ambiente (GitHub Secrets)
- ✅ Regras de segurança no Firebase Realtime Database
- ✅ Validação de dados no servidor
- ✅ Rate limiting e tamanho máximo de mensagens
- ✅ Sanitização de entrada para prevenir XSS
- ✅ Autenticação anônima do Firebase

## ⚙️ Configuração do Firebase

### Passo 1: Criar projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome (ex: "chatpad-app")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

### Passo 2: Configurar Realtime Database

1. No menu lateral, vá em **Build > Realtime Database**
2. Clique em "Criar banco de dados"
3. Escolha uma localização (ex: `southamerica-east1` para São Paulo)
4. Inicie em **modo bloqueado** (não use modo de teste!)
5. Clique em "Ativar"

### Passo 3: Configurar Authentication

1. No menu lateral, vá em **Build > Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", ative **Anônimo**
4. Clique em "Salvar"

### Passo 4: Configurar Regras de Segurança

No Firebase Console, vá em **Realtime Database > Regras** e substitua pelas regras seguras:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "metadata": {
          ".validate": "newData.hasChildren(['createdAt', 'name'])",
          "createdAt": {
            ".validate": "newData.isNumber()"
          },
          "name": {
            ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 30"
          }
        },
        "messages": {
          "$messageId": {
            ".validate": "newData.hasChildren(['content', 'timestamp', 'userId'])",
            "content": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500"
            },
            "timestamp": {
              ".validate": "newData.isNumber() && newData.val() <= now"
            },
            "userId": {
              ".validate": "newData.isString()"
            },
            "color": {
              ".validate": "newData.isString()"
            },
            "$other": {
              ".validate": false
            }
          },
          ".indexOn": ["timestamp"]
        },
        "$other": {
          ".validate": false
        }
      }
    }
  }
}
```

**🔐 O que essas regras fazem:**

- ✅ Exige autenticação (mesmo que anônima)
- ✅ Valida estrutura dos dados
- ✅ Limita tamanho de mensagens (max 500 caracteres)
- ✅ Valida nome da sala (3-30 caracteres)
- ✅ Previne campos não autorizados
- ✅ Valida timestamps

### Passo 5: Configurar App Web

1. Clique no ícone de engrenagem ⚙️ > **Configurações do projeto**
2. Role até "Seus aplicativos"
3. Clique no ícone **</>** (Web)
4. Registre um apelido (ex: "chatpad-web")
5. **NÃO** marque Firebase Hosting
6. Copie as credenciais do `firebaseConfig`

### Passo 6: Configurar GitHub Secrets (IMPORTANTE!)

**NÃO coloque suas credenciais Firebase direto no código!**

1. No GitHub, vá até o repositório
2. **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione cada variável:

```
Nome: FIREBASE_API_KEY
Valor: sua-api-key-aqui

Nome: FIREBASE_AUTH_DOMAIN
Valor: seu-projeto.firebaseapp.com

Nome: FIREBASE_DATABASE_URL
Valor: https://seu-projeto-default-rtdb.firebaseio.com

Nome: FIREBASE_PROJECT_ID
Valor: seu-projeto-id

Nome: FIREBASE_STORAGE_BUCKET
Valor: seu-projeto.appspot.com

Nome: FIREBASE_MESSAGING_SENDER_ID
Valor: 123456789012

Nome: FIREBASE_APP_ID
Valor: 1:123456789012:web:abcdef123456
```

### Passo 7: Configurar GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado para:
1. Substituir as variáveis de ambiente
2. Fazer deploy automático no GitHub Pages

### Passo 8: Ativar GitHub Pages

1. Vá em **Settings > Pages**
2. Em "Build and deployment":
   - Source: **GitHub Actions**
3. Aguarde o primeiro deploy (veja na aba **Actions**)
4. Seu site estará em: `https://ilmoretto.github.io/nome-do-repo`

## 🌐 Deploy Manual (Alternativa)

Se não quiser usar GitHub Actions:

1. Substitua as variáveis em `firebase-config.js` manualmente
2. Faça upload dos arquivos para o repositório
3. Ative GitHub Pages: **Settings > Pages > Source: main branch**

**⚠️ Atenção**: Suas credenciais ficarão públicas no código. Use apenas para testes!

## 📁 Estrutura do projeto

```
chatpad/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions para deploy seguro
├── index.html               # Página principal
├── style.css                # Estilos
├── app.js                   # Lógica do chat
├── firebase-config.js       # Template de configuração
└── README.md                # Este arquivo
```

## 🎨 Funcionalidades

- ✅ Chat em tempo real
- ✅ Salas com nomes personalizados
- ✅ Mensagens anônimas com cores aleatórias
- ✅ Interface responsiva
- ✅ Sem necessidade de cadastro ou apelido
- ✅ Scroll automático para novas mensagens
- ✅ Validação de sala existente
- ✅ Contador de usuários online

## 🔒 Boas Práticas de Segurança Implementadas

### 1. **Credenciais Protegidas**
- Nunca exponha API keys no código fonte
- Use GitHub Secrets + GitHub Actions
- Rotacione chaves regularmente

### 2. **Regras Firebase Rigorosas**
- Validação de dados no servidor
- Autenticação obrigatória
- Limites de tamanho e formato

### 3. **Proteção XSS**
- Sanitização de todo input do usuário
- Escape de HTML antes de renderizar

### 4. **Rate Limiting**
- Firebase automaticamente limita requisições abusivas
- Monitore uso no Firebase Console

### 5. **HTTPS Obrigatório**
- GitHub Pages usa HTTPS por padrão
- Firebase só aceita conexões seguras

## 📊 Monitoramento

Verifique regularmente no Firebase Console:
- **Authentication** > Usuários anônimos
- **Realtime Database** > Dados e uso
- **Usage and billing** > Métricas

## 🚨 Em caso de abuso

Se detectar spam ou abuso:

1. **Limpar dados**: Database > Delete all data
2. **Restringir regras**: Adicione rate limiting
3. **Rotacionar chaves**: Se credenciais vazaram

## 📝 Licença

MIT License - sinta-se livre para usar e modificar!

---

**Dúvidas?** Abra uma issue no GitHub!