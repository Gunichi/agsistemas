# Backend - Plataforma de Gestão de Networking

API backend desenvolvida com NestJS + Prisma + PostgreSQL para gestão de grupos de networking focados em geração de negócios.

## 🚀 Stacks

- **NestJS 10** - Framework Node.js progressivo
- **Prisma ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL 15+** - Banco de dados relacional
- **Swagger/OpenAPI** - Documentação automática da API
- **TypeScript** - Linguagem type-safe
- **Class Validator** - Validação de DTOs
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 20+ instalado
- PostgreSQL 15+ instalado e rodando
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório e instale as dependências

```bash
cd backend
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/networking_platform?schema=public"

# Server
PORT=3000
NODE_ENV=development

# Admin API Key (para autenticação de administrador)
ADMIN_API_KEY=minha-chave-secreta-admin

# Application
APP_URL=http://localhost:3000
```

### 3. Configure o banco de dados

Crie o banco de dados no PostgreSQL:

```bash
createdb networking_platform
```

Ou via SQL:

```sql
CREATE DATABASE networking_platform;
```

### 4. Execute as migrations do Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5.  Popule o banco com dados de exemplo para melhor visualização

```bash
npm run prisma:seed
```

### Modo de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

### Modo de produção

```bash
npm run build
npm run start:prod
```

## Documentação da API

Após iniciar a aplicação, acesse a documentação interativa do Swagger:

**URL:** `http://localhost:3000/api/docs`

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de request/response
- Possibilidade de testar os endpoints diretamente
- Autenticação via API Key

## 🔑 Autenticação

### API Key (Admin)

Para endpoints administrativos, adicione o header:

```
X-API-KEY: sua-chave-api-configurada-no-env 
```

### Endpoints Públicos


## Fluxo pensado:

### 1. Candidato submete intenção

```bash
curl -X POST http://localhost:3000/membership-intents \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "email": "joao@empresa.com",
    "phone": "+5511999999999",
    "company": "Empresa XPTO Ltda",
    "industry": "Tecnologia",
    "motivation": "Desejo expandir minha rede de contatos e gerar novos negócios..."
  }'
```

### 2. Admin visualiza intenções pendentes

```bash
curl -X GET "http://localhost:3000/membership-intents?status=PENDING" \
  -H "X-API-KEY: minha-chave-secreta-admin"
```

### 3. Admin aprova a intenção

```bash
curl -X PATCH http://localhost:3000/membership-intents/{id}/approve \
  -H "X-API-KEY: minha-chave-secreta-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Perfil adequado ao grupo"
  }'
```

**Resposta incluirá:**
- `inviteToken`: Token único para cadastro
- `tokenExpiresAt`: Data de expiração (7 dias)

**Email simulado será exibido no console:**
```
   Intenção aprovada para: joao@empresa.com
   Token de convite: abc-123-def-456
```

### 4. Candidato valida o token

### 5. Candidato completa o cadastro

```bash
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{
    "intentId": "uuid-da-intencao",
    "fullName": "João Silva",
    "email": "joao@empresa.com",
    "phone": "+5511999999999",
    "cpf": "123.456.789-00",
    "birthDate": "1985-05-20",
    "company": "Empresa XPTO Ltda",
    "position": "Diretor Comercial",
    "industry": "Tecnologia",
    "businessDescription": "Soluções em software...",
    "website": "https://empresa.com",
    "linkedinUrl": "https://linkedin.com/in/joao",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01234-567"
    }
  }'
```

## 📦 Endpoints Principais

### Membership Intents (Intenções)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/membership-intents` | Criar intenção | Público |
| GET | `/membership-intents` | Listar intenções | API Key |
| GET | `/membership-intents/:id` | Buscar por ID | API Key |
| PATCH | `/membership-intents/:id/approve` | Aprovar | API Key |
| PATCH | `/membership-intents/:id/reject` | Rejeitar | API Key |
| GET | `/membership-intents/validate-token/:token` | Validar token | Público |

### Members (Membros)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/members` | Cadastrar membro | Público (com token) |
| GET | `/members` | Listar membros | API Key |
| GET | `/members/:id` | Buscar por ID | API Key |
| PATCH | `/members/:id` | Atualizar | API Key |
| DELETE | `/members/:id` | Inativar | API Key |

## 🧪 Testes

### Executar testes unitários

```bash
npm test
```

### Executar testes com coverage

```bash
npm run test:cov
```

### Executar testes e2e

```bash
npm run test:e2e
```

## 🗄️ Banco de Dados

### Visualizar dados (Prisma Studio)

```bash
npm run prisma:studio
```

Abre interface web em `http://localhost:5555` para visualizar e editar dados.

### Criar nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

## 📊 Estrutura do Projeto

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── auth/                  # Módulo de autenticação
│   ├── common/                # Utilitários compartilhados
│   │   ├── decorators/        # Decorators customizados
│   │   ├── dto/               # DTOs comuns
│   │   └── guards/            # Guards de autenticação
│   ├── members/               # Módulo de membros
│   │   ├── dto/               # DTOs específicos
│   │   ├── members.controller.ts
│   │   ├── members.service.ts
│   │   └── members.module.ts
│   ├── membership-intents/    # Módulo de intenções
│   │   ├── dto/
│   │   ├── membership-intents.controller.ts
│   │   ├── membership-intents.service.ts
│   │   └── membership-intents.module.ts
│   ├── prisma/                # Módulo Prisma
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts          # Módulo principal
│   └── main.ts                # Entry point
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de variáveis
├── package.json
└── README.md
```

## 📝 Scripts Disponíveis

```bash
npm run start           # Inicia em modo normal
npm run start:dev       # Inicia com hot-reload
npm run start:debug     # Inicia com debugger
npm run start:prod      # Inicia versão de produção
npm run build           # Build de produção
npm run format          # Formata código com Prettier
npm run lint            # Executa ESLint
npm run test            # Executa testes
npm run test:watch      # Testes em watch mode
npm run test:cov        # Testes com coverage
npm run prisma:generate # Gera Prisma Client
npm run prisma:migrate  # Executa migrations
npm run prisma:studio   # Abre Prisma Studio
```



