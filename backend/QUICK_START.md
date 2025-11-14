# 🚀 Quick Start - Backend API

Guia rápido para colocar a API rodando em minutos!

## ⚡ Instalação Rápida

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Subir o banco de dados com Docker
```bash
docker-compose up -d
```

Ou configure PostgreSQL manualmente e atualize o `.env`

### 3. Executar migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Popular banco com dados de exemplo (opcional)
```bash
npm run prisma:seed
```

### 5. Iniciar a aplicação
```bash
npm run start:dev
```

✅ **API rodando em:** `http://localhost:3000`  
📚 **Documentação:** `http://localhost:3000/api/docs`

---

## 🧪 Testar a API

### 1️⃣ Criar uma Intenção de Participação (Público)

```bash
curl -X POST http://localhost:3000/membership-intents \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João da Silva",
    "email": "joao.teste@example.com",
    "phone": "+5511999998888",
    "company": "Minha Empresa",
    "industry": "Tecnologia",
    "motivation": "Desejo expandir minha rede de contatos profissionais e gerar novos negócios através do networking estratégico. Tenho interesse em contribuir com o grupo."
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "fullName": "João da Silva",
    "email": "joao.teste@example.com",
    "status": "PENDING",
    "createdAt": "2025-11-11T..."
  },
  "message": "Sua intenção foi registrada com sucesso! Entraremos em contato em breve."
}
```

---

### 2️⃣ Listar Intenções Pendentes (Admin)

```bash
curl -X GET "http://localhost:3000/membership-intents?status=PENDING" \
  -H "X-API-KEY: admin-secret-key-12345"
```

---

### 3️⃣ Aprovar Intenção (Admin)

Copie o `id` da intenção criada e use:

```bash
curl -X PATCH http://localhost:3000/membership-intents/SEU-UUID-AQUI/approve \
  -H "X-API-KEY: admin-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Perfil interessante para o grupo"
  }'
```

**Resposta incluirá o token de convite:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "inviteToken": "token-gerado-automaticamente",
    "tokenExpiresAt": "2025-11-18T..."
  },
  "message": "Intenção aprovada. Email de confirmação enviado ao candidato."
}
```

**No console você verá:**
```
📧 [SIMULATED EMAIL] Intenção aprovada para: joao.teste@example.com
   Token de convite: abc-123-def
   Link: http://localhost:3001/cadastro?token=abc-123-def
```

---

### 4️⃣ Validar Token de Convite (Público)

```bash
curl -X GET http://localhost:3000/membership-intents/validate-token/SEU-TOKEN-AQUI
```

---

### 5️⃣ Cadastrar Membro Completo (Público com token)

Use o `intentId` (UUID da intenção aprovada):

```bash
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{
    "intentId": "UUID-DA-INTENCAO-APROVADA",
    "fullName": "João da Silva",
    "email": "joao.teste@example.com",
    "phone": "+5511999998888",
    "cpf": "111.222.333-44",
    "birthDate": "1990-01-15",
    "company": "Minha Empresa Ltda",
    "position": "CEO",
    "industry": "Tecnologia",
    "businessDescription": "Desenvolvemos soluções inovadoras em tecnologia",
    "website": "https://minhaempresa.com",
    "linkedinUrl": "https://linkedin.com/in/joaosilva",
    "address": {
      "street": "Rua das Flores",
      "number": "100",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01234-567"
    }
  }'
```

**Sucesso! Membro cadastrado.** 🎉

---

### 6️⃣ Listar Todos os Membros (Admin)

```bash
curl -X GET "http://localhost:3000/members" \
  -H "X-API-KEY: admin-secret-key-12345"
```

---

## 🔑 Credenciais de Teste (após seed)

**API Key Admin:**
```
admin-secret-key-12345
```

**Usuário Admin (para futuro login):**
- Email: `admin@networking.com`
- Senha: `admin123`

**Membros de teste:**
- Email: `joao@empresa.com` | Senha: `senha123`
- Email: `lucia@advocacia.com` | Senha: `senha123`

---

## 📊 Explorando os Dados

### Prisma Studio (Interface Visual)
```bash
npm run prisma:studio
```
Acesse: `http://localhost:5555`

---

## 🐛 Problemas Comuns

### Erro de conexão com o banco
```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Ou inicie novamente
docker-compose up -d
```

### Erro de migrations
```bash
# Resete o banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Execute novamente
npm run prisma:migrate
```

### Porta 3000 já em uso
Altere no `.env`:
```env
PORT=3001
```

---

## 📚 Próximos Passos

1. Explore a documentação Swagger: `http://localhost:3000/api/docs`
2. Teste todos os endpoints interativamente no Swagger
3. Implemente o frontend consumindo esta API
4. Adicione novos módulos (Referrals, Meetings, etc.)

---

## 🎯 Fluxo Completo Resumido

```
1. Candidato → POST /membership-intents (público)
2. Admin → GET /membership-intents?status=PENDING (com API Key)
3. Admin → PATCH /membership-intents/:id/approve (com API Key)
   └─ Sistema gera token de convite
4. Candidato → GET /validate-token/:token (público)
5. Candidato → POST /members (público, com intentId)
   └─ Membro cadastrado! ✅
6. Admin → GET /members (com API Key)
```

---

**Dúvidas?** Consulte o `README.md` completo ou a documentação no Swagger! 🚀


