# Desafio - Plataforma de Gestão para Grupos de Gestão de Networking

## Resumo

Este documento demonstra a arquitetura completa de uma plataforma para a gestão de grupos de networking, O sistema substituirá planilhas e controles manuais por uma solução centralizada, escalável e eficiente.

---

## 1. Visão Geral da Arquitetura

### 1.1 Stack Tecnológica

**Frontend:**
- Next.js 14+ (React 18+)
- TypeScript
- TailwindCSS
- Shadcn/ui (componentes)
- React Query (gerenciamento de estado servidor)

**Backend:**
- Node.js 20+
- NestJS
- TypeScript
- Prisma ORM
- JWT para autenticação
- Zod para validação

**Banco de Dados:**
- PostgreSQL 15+ (dados principais)

---

## 2. Modelo de Dados

### 2.1 Justificativa: PostgreSQL

Optei por **PostgreSQL** pelos seguintes motivos:

1. **Familiaridade**: Eu tenho a familiaridade de sempre usar PostgreSQL em todos os meus projetos.
1. **Relacionamentos**: O banco possui muitas relações, portanto creio que o PostgreSQL seja o ideal para isso. (membros, indicações, reuniões, pagamentos)
3. **Facilidade em consultas**: Consigo fazer consultas e relacionamentos de forma mais fácil.

### 2.2 Diagrama de classes

![Diagrama](https://i.imgur.com/u83sATr.pngg)

### 2.3 Esquema do Banco de Dados

```sql
-- =============================================
-- TABELA: users
-- Descrição: Usuários do sistema (base para membros e admins)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- =============================================
-- TABELA: membership_intents
-- Descrição: Solicitações de intenção de participação
-- =============================================
CREATE TABLE membership_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    industry VARCHAR(100),
    motivation TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membership_intents_status ON membership_intents(status);
CREATE INDEX idx_membership_intents_email ON membership_intents(email);

-- =============================================
-- TABELA: members
-- Descrição: Membros completos e ativos do grupo
-- =============================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    intent_id UUID REFERENCES membership_intents(id),
    
    -- Dados Pessoais
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    cpf VARCHAR(14) UNIQUE,
    birth_date DATE,
    photo_url TEXT,
    
    -- Dados Profissionais
    company VARCHAR(255),
    position VARCHAR(100),
    industry VARCHAR(100),
    business_description TEXT,
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- Dados de Endereço
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    
    -- Status e Metadata
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    membership_start_date DATE DEFAULT CURRENT_DATE,
    membership_end_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_user_id ON members(user_id);

-- =============================================
-- TABELA: announcements
-- Descrição: Avisos e comunicados para membros
-- =============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'specific')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_published ON announcements(is_published, published_at);

-- =============================================
-- TABELA: announcement_reads
-- Descrição: Controle de leitura de avisos
-- =============================================
CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, member_id)
);

-- =============================================
-- TABELA: meetings
-- Descrição: Reuniões do grupo
-- =============================================
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    location VARCHAR(255),
    meeting_type VARCHAR(50) DEFAULT 'regular' CHECK (meeting_type IN ('regular', 'special', 'online')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meetings_date ON meetings(meeting_date, status);

-- =============================================
-- TABELA: meeting_attendances
-- Descrição: Check-in de presença em reuniões
-- =============================================
CREATE TABLE meeting_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'excused')),
    notes TEXT,
    
    UNIQUE(meeting_id, member_id)
);

CREATE INDEX idx_attendances_meeting ON meeting_attendances(meeting_id);
CREATE INDEX idx_attendances_member ON meeting_attendances(member_id);

-- =============================================
-- TABELA: business_referrals
-- Descrição: Indicações e referências de negócios
-- =============================================
CREATE TABLE business_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quem deu a indicação
    referrer_id UUID REFERENCES members(id),
    
    -- Para quem foi a indicação
    referred_to_id UUID REFERENCES members(id),
    
    -- Dados da Indicação
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    description TEXT NOT NULL,
    estimated_value DECIMAL(15, 2),
    
    -- Status e Acompanhamento
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Aguardando contato
        'contacted',    -- Contato realizado
        'negotiating',  -- Em negociação
        'closed',       -- Negócio fechado
        'lost',         -- Negócio perdido
        'cancelled'     -- Cancelado
    )),
    
    -- Feedback
    feedback TEXT,
    closed_value DECIMAL(15, 2),
    closed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON business_referrals(referrer_id);
CREATE INDEX idx_referrals_referred_to ON business_referrals(referred_to_id);
CREATE INDEX idx_referrals_status ON business_referrals(status);

-- =============================================
-- TABELA: referral_status_history
-- Descrição: Histórico de mudanças de status das indicações
-- =============================================
CREATE TABLE referral_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID REFERENCES business_referrals(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: thank_yous
-- Descrição: Agradecimentos públicos por negócios fechados
-- =============================================
CREATE TABLE thank_yous (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID REFERENCES business_referrals(id),
    from_member_id UUID REFERENCES members(id),
    to_member_id UUID REFERENCES members(id),
    message TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    business_value DECIMAL(15, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_thank_yous_public ON thank_yous(is_public, created_at);

-- =============================================
-- TABELA: one_on_one_meetings
-- Descrição: Reuniões 1 a 1 entre membros
-- =============================================
CREATE TABLE one_on_one_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member1_id UUID REFERENCES members(id),
    member2_id UUID REFERENCES members(id),
    meeting_date DATE NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    
    -- Quem registrou o encontro
    registered_by UUID REFERENCES members(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (member1_id != member2_id)
);

CREATE INDEX idx_one_on_one_members ON one_on_one_meetings(member1_id, member2_id);
CREATE INDEX idx_one_on_one_date ON one_on_one_meetings(meeting_date);

-- =============================================
-- TABELA: monthly_fees
-- Descrição: Mensalidades dos membros
-- =============================================
CREATE TABLE monthly_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    
    -- Dados da Mensalidade
    reference_month INTEGER NOT NULL, -- 1-12
    reference_year INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    
    -- Status de Pagamento
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Aguardando pagamento
        'paid',         -- Pago
        'overdue',      -- Atrasado
        'cancelled',    -- Cancelado
        'refunded'      -- Reembolsado
    )),
    
    -- Dados de Pagamento
    payment_date TIMESTAMP,
    payment_method VARCHAR(50), -- boleto, pix, cartao, transferencia
    payment_transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    
    -- Observações
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(member_id, reference_month, reference_year)
);

CREATE INDEX idx_monthly_fees_member ON monthly_fees(member_id);
CREATE INDEX idx_monthly_fees_status ON monthly_fees(status);
CREATE INDEX idx_monthly_fees_due_date ON monthly_fees(due_date);
CREATE INDEX idx_monthly_fees_reference ON monthly_fees(reference_year, reference_month);

-- =============================================
-- TABELA: payment_reminders
-- Descrição: Lembretes de pagamento enviados
-- =============================================
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_fee_id UUID REFERENCES monthly_fees(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) CHECK (reminder_type IN ('email', 'sms', 'whatsapp')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'failed'))
);

-- =============================================
-- TABELA: notifications
-- Descrição: Sistema de notificações gerais
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- announcement, referral, payment, meeting, etc.
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50), -- 'referral', 'meeting', 'payment', etc.
    related_entity_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- TABELA: audit_logs
-- Descrição: Auditoria de ações importantes no sistema
-- =============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## 3. Estrutura de Componentes Frontend (Next.js)

### 3.1 Organização de Pastas

```
src/
├── app/                          # App Router (Next.js 14+)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (public)/                 # Rotas públicas
│   │   ├── apply/                # Formulário de intenção
│   │   └── about/
│   ├── (dashboard)/              # Rotas protegidas
│   │   ├── layout.tsx            # Layout com sidebar e header
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── members/              # Gestão de membros
│   │   ├── referrals/            # Indicações de negócio
│   │   ├── meetings/             # Reuniões
│   │   ├── announcements/        # Avisos
│   │   ├── one-on-one/           # Reuniões 1-1
│   │   ├── payments/             # Financeiro
│   │   └── reports/              # Relatórios
│   └── api/                      # API Routes (se necessário)
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (Shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                   # Componentes de layout
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   ├── forms/                    # Formulários complexos
│   │   ├── MembershipIntentForm.tsx
│   │   ├── MemberRegistrationForm.tsx
│   │   ├── ReferralForm.tsx
│   │   └── MeetingCheckInForm.tsx
│   ├── features/                 # Componentes por funcionalidade
│   │   ├── members/
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── MemberProfile.tsx
│   │   │   └── MemberFilters.tsx
│   │   ├── referrals/
│   │   │   ├── ReferralCard.tsx
│   │   │   ├── ReferralStatusBadge.tsx
│   │   │   ├── ReferralTimeline.tsx
│   │   │   └── ThankYouCard.tsx
│   │   ├── meetings/
│   │   │   ├── MeetingCard.tsx
│   │   │   ├── AttendanceList.tsx
│   │   │   └── CheckInButton.tsx
│   │   ├── payments/
│   │   │   ├── PaymentCard.tsx
│   │   │   ├── PaymentStatus.tsx
│   │   │   └── InvoiceDownload.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── RecentActivity.tsx
│   │       ├── PerformanceChart.tsx
│   │       └── MemberRanking.tsx
│   └── shared/                   # Componentes compartilhados
│       ├── DataTable.tsx
│       ├── SearchBar.tsx
│       ├── DateRangePicker.tsx
│       ├── FileUpload.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
│
├── lib/                          # Utilitários e configurações
│   ├── api/                      # Clients e serviços de API
│   │   ├── client.ts             # Axios instance configurado
│   │   ├── members.ts
│   │   ├── referrals.ts
│   │   ├── meetings.ts
│   │   └── payments.ts
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useMembers.ts
│   │   ├── useReferrals.ts
│   │   └── useDebounce.ts
│   ├── utils/                    # Funções utilitárias
│   │   ├── format.ts             # Formatação de datas, valores
│   │   ├── validation.ts         # Validações
│   │   └── constants.ts
│   └── stores/                   # Zustand stores (estado global)
│       ├── authStore.ts
│       ├── notificationStore.ts
│       └── uiStore.ts
│
├── types/                        # TypeScript types/interfaces
│   ├── user.ts
│   ├── member.ts
│   ├── referral.ts
│   ├── meeting.ts
│   └── payment.ts
│
└── styles/                       # Estilos globais
    └── globals.css
```

## 4. Definição da API REST

### 4.1 Convenções Gerais

**Autenticação**: Bearer Token (JWT)
```
Authorization: Bearer <token>
```

**Formato de Resposta Padrão**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "meta": {
    "timestamp": "2025-11-11T10:30:00Z",
    "requestId": "uuid"
  }
}
```

**Formato de Erro Padrão**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-11T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### 4.2 Endpoints de Autenticação

#### POST /auth/login
Realiza login no sistema.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "role": "member"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
```

#### POST /auth/register
Registro de novo usuário (após aprovação).

#### POST /auth/refresh
Renova token de autenticação.

#### POST /auth/logout
Realiza logout (invalida token).

---

### 4.3 Endpoints de Gestão de Membros

#### POST /membership-intents
Cria uma nova intenção de participação (formulário público).

**Request:**
```json
{
  "fullName": "João Silva",
  "email": "joao@empresa.com",
  "phone": "+5511999999999",
  "company": "Empresa XPTO Ltda",
  "industry": "Tecnologia",
  "motivation": "Desejo expandir minha rede de contatos e gerar novos negócios..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "João Silva",
    "email": "joao@empresa.com",
    "status": "pending",
    "createdAt": "2025-11-11T10:30:00Z"
  },
  "message": "Sua intenção foi registrada com sucesso! Entraremos em contato em breve."
}
```

**Validações:**
- Email único e válido
- Nome completo obrigatório
- Telefone em formato válido

---

#### GET /membership-intents
Lista intenções de participação (apenas admins).

**Query Parameters:**
- `status`: pending | approved | rejected
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 20)
- `sort`: createdAt | fullName
- `order`: asc | desc

**Response (200):**
```json
{
  "success": true,
  "data": {
    "intents": [
      {
        "id": "uuid",
        "fullName": "João Silva",
        "email": "joao@empresa.com",
        "phone": "+5511999999999",
        "company": "Empresa XPTO Ltda",
        "industry": "Tecnologia",
        "motivation": "Desejo expandir...",
        "status": "pending",
        "createdAt": "2025-11-11T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 98,
      "itemsPerPage": 20
    }
  }
}
```

---

#### PATCH /membership-intents/:id/approve
Aprova uma intenção de participação (apenas admins).

**Request:**
```json
{
  "notes": "Perfil adequado ao grupo"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "reviewedBy": "admin-uuid",
    "reviewedAt": "2025-11-11T11:00:00Z"
  },
  "message": "Intenção aprovada. Email de confirmação enviado ao candidato."
}
```

**Side Effects:**
- Envia email ao candidato com link para completar cadastro
- Cria registro na tabela de auditoria

---

#### PATCH /membership-intents/:id/reject
Rejeita uma intenção de participação (apenas admins).

**Request:**
```json
{
  "reason": "Segmento de negócio já representado no grupo"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "reviewedBy": "admin-uuid",
    "reviewedAt": "2025-11-11T11:00:00Z"
  },
  "message": "Intenção rejeitada."
}
```

---

#### GET /members
Lista membros do grupo.

**Query Parameters:**
- `status`: active | inactive | suspended
- `industry`: filtro por indústria
- `search`: busca por nome ou empresa
- `page`, `limit`, `sort`, `order`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "fullName": "Maria Santos",
        "email": "maria@empresa.com",
        "phone": "+5511988888888",
        "company": "Consultoria ABC",
        "position": "CEO",
        "industry": "Consultoria",
        "photoUrl": "https://cdn.example.com/photos/maria.jpg",
        "status": "active",
        "membershipStartDate": "2025-01-15",
        "stats": {
          "referralsGiven": 12,
          "referralsReceived": 8,
          "businessClosed": 3,
          "totalValue": 150000.00
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### POST /members
Cria um novo membro completo (após aprovação).

**Request:**
```json
{
  "intentId": "uuid",
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
    "complement": "Sala 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01234-567"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "João Silva",
    "email": "joao@empresa.com",
    "status": "active",
    "membershipStartDate": "2025-11-11"
  },
  "message": "Membro cadastrado com sucesso!"
}
```

---

#### GET /members/:id
Obtém detalhes de um membro específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "João Silva",
    "email": "joao@empresa.com",
    // ... todos os campos do membro
    "statistics": {
      "referralsGiven": 15,
      "referralsReceived": 10,
      "businessClosed": 4,
      "totalBusinessValue": 250000.00,
      "meetingsAttended": 45,
      "attendanceRate": 0.95,
      "oneOnOneMeetings": 28
    }
  }
}
```

---

#### PUT /members/:id
Atualiza dados de um membro.

#### DELETE /members/:id
Inativa um membro (soft delete).

---

### 4.4 Endpoints de Indicações de Negócio

#### POST /referrals
Cria uma nova indicação de negócio.

**Request:**
```json
{
  "referredToId": "uuid-do-membro-que-recebe",
  "clientName": "Empresa Cliente LTDA",
  "clientPhone": "+5511977777777",
  "clientEmail": "contato@cliente.com",
  "description": "Cliente em busca de consultoria em gestão de projetos. Orçamento estimado em R$ 50.000,00. Contato preferencial por email.",
  "estimatedValue": 50000.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referrerId": "uuid-atual",
    "referredToId": "uuid-destino",
    "clientName": "Empresa Cliente LTDA",
    "status": "pending",
    "estimatedValue": 50000.00,
    "createdAt": "2025-11-11T10:30:00Z"
  },
  "message": "Indicação criada com sucesso!"
}
```

**Validações:**
- Usuário autenticado não pode indicar para si mesmo
- Membro destinatário deve estar ativo
- Valor estimado deve ser positivo
- Descrição mínima de 20 caracteres

**Side Effects:**
- Notificação enviada ao membro que recebeu a indicação
- Registro na timeline da indicação

---

#### GET /referrals
Lista indicações de negócio.

**Query Parameters:**
- `status`: pending | contacted | negotiating | closed | lost | cancelled
- `type`: given (dadas) | received (recebidas)
- `startDate`, `endDate`: filtro por período
- `minValue`, `maxValue`: filtro por valor
- `page`, `limit`, `sort`, `order`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "uuid",
        "referrer": {
          "id": "uuid",
          "fullName": "Maria Santos",
          "company": "Consultoria ABC"
        },
        "referredTo": {
          "id": "uuid",
          "fullName": "João Silva",
          "company": "Empresa XPTO"
        },
        "clientName": "Empresa Cliente LTDA",
        "description": "Cliente em busca de...",
        "estimatedValue": 50000.00,
        "status": "negotiating",
        "createdAt": "2025-11-11T10:30:00Z",
        "updatedAt": "2025-11-15T14:20:00Z"
      }
    ],
    "statistics": {
      "total": 45,
      "pending": 12,
      "closed": 8,
      "totalClosedValue": 450000.00
    },
    "pagination": { ... }
  }
}
```

---

#### GET /referrals/:id
Obtém detalhes completos de uma indicação.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referrer": { ... },
    "referredTo": { ... },
    "clientName": "Empresa Cliente LTDA",
    "clientPhone": "+5511977777777",
    "clientEmail": "contato@cliente.com",
    "description": "Cliente em busca de...",
    "estimatedValue": 50000.00,
    "status": "negotiating",
    "feedback": "Cliente muito receptivo, reunião agendada para próxima semana",
    "closedValue": null,
    "closedAt": null,
    "createdAt": "2025-11-11T10:30:00Z",
    "updatedAt": "2025-11-15T14:20:00Z",
    "statusHistory": [
      {
        "id": "uuid",
        "fromStatus": "pending",
        "toStatus": "contacted",
        "changedAt": "2025-11-12T09:00:00Z",
        "notes": "Primeiro contato realizado"
      },
      {
        "id": "uuid",
        "fromStatus": "contacted",
        "toStatus": "negotiating",
        "changedAt": "2025-11-15T14:20:00Z",
        "notes": "Proposta enviada"
      }
    ]
  }
}
```

---

#### PATCH /referrals/:id/status
Atualiza o status de uma indicação.

**Request:**
```json
{
  "status": "closed",
  "closedValue": 48000.00,
  "feedback": "Negócio fechado! Cliente assinou contrato de 12 meses."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "closed",
    "closedValue": 48000.00,
    "closedAt": "2025-11-20T16:00:00Z",
    "feedback": "Negócio fechado! Cliente assinou contrato de 12 meses."
  },
  "message": "Status atualizado com sucesso!"
}
```

**Regras de Negócio:**
- Apenas o membro que recebeu a indicação pode atualizar o status
- Status 'closed' requer valor final (closedValue)
- Transições de status são registradas no histórico
- Mudança para 'closed' permite criar agradecimento (thank you)

---

#### POST /referrals/:id/thank-you
Cria um agradecimento público por negócio fechado.

**Request:**
```json
{
  "message": "Obrigado Maria pela excelente indicação! O cliente ficou muito satisfeito com nossa proposta e fechamos um contrato de R$ 48.000,00. Sua confiança em meu trabalho é fundamental!",
  "isPublic": true,
  "businessValue": 48000.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referralId": "uuid",
    "fromMember": { ... },
    "toMember": { ... },
    "message": "Obrigado Maria...",
    "isPublic": true,
    "businessValue": 48000.00,
    "createdAt": "2025-11-20T17:00:00Z"
  },
  "message": "Agradecimento publicado com sucesso!"
}
```

---

### 4.5 Endpoints de Reuniões e Presença

#### GET /meetings
Lista reuniões do grupo.

**Query Parameters:**
- `status`: scheduled | ongoing | completed | cancelled
- `startDate`, `endDate`
- `type`: regular | special | online

**Response (200):**
```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "id": "uuid",
        "title": "Reunião Semanal #42",
        "description": "Reunião semanal de networking",
        "meetingDate": "2025-11-15",
        "meetingTime": "08:00:00",
        "location": "Hotel Plaza - Sala Executiva",
        "meetingType": "regular",
        "status": "scheduled",
        "attendanceStats": {
          "confirmed": 28,
          "present": 0,
          "totalMembers": 35
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### POST /meetings
Cria uma nova reunião (apenas admins).

**Request:**
```json
{
  "title": "Reunião Semanal #43",
  "description": "Reunião semanal de networking com palestra especial",
  "meetingDate": "2025-11-22",
  "meetingTime": "08:00",
  "location": "Hotel Plaza - Sala Executiva",
  "meetingType": "regular"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Reunião Semanal #43",
    "meetingDate": "2025-11-22",
    "status": "scheduled"
  },
  "message": "Reunião criada com sucesso!"
}
```

---

#### POST /meetings/:id/check-in
Realiza check-in de presença em uma reunião.

**Request:**
```json
{
  "notes": "Cheguei pontualmente"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "meetingId": "uuid",
    "memberId": "uuid",
    "checkInTime": "2025-11-15T07:58:00Z",
    "status": "present"
  },
  "message": "Check-in realizado com sucesso!"
}
```

**Regras de Negócio:**
- Check-in só pode ser feito no dia da reunião
- Check-in feito com mais de 10 minutos de atraso marca como 'late'
- Um membro só pode fazer check-in uma vez por reunião

---

#### GET /meetings/:id/attendances
Lista presenças de uma reunião específica (apenas admins).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "meeting": {
      "id": "uuid",
      "title": "Reunião Semanal #42",
      "meetingDate": "2025-11-15"
    },
    "attendances": [
      {
        "id": "uuid",
        "member": {
          "id": "uuid",
          "fullName": "João Silva",
          "company": "Empresa XPTO"
        },
        "checkInTime": "2025-11-15T07:55:00Z",
        "status": "present"
      },
      {
        "id": "uuid",
        "member": {
          "id": "uuid",
          "fullName": "Maria Santos",
          "company": "Consultoria ABC"
        },
        "checkInTime": "2025-11-15T08:12:00Z",
        "status": "late"
      }
    ],
    "statistics": {
      "totalMembers": 35,
      "present": 28,
      "late": 3,
      "absent": 4,
      "attendanceRate": 0.89
    }
  }
}
```

---

### 4.6 Endpoints de Avisos/Comunicados

#### GET /announcements
Lista avisos publicados.

#### POST /announcements
Cria novo aviso (apenas admins).

#### PATCH /announcements/:id/read
Marca aviso como lido.

---

### 4.7 Endpoints de Reuniões 1-a-1

#### GET /one-on-one-meetings
Lista reuniões 1-a-1 do membro.

#### POST /one-on-one-meetings
Registra uma reunião 1-a-1.

---

### 4.8 Endpoints Financeiros

#### GET /monthly-fees
Lista mensalidades do membro ou de todos (admin).

#### GET /monthly-fees/:id
Detalhes de uma mensalidade específica.

#### POST /monthly-fees/generate
Gera mensalidades para todos os membros (apenas admins).

#### PATCH /monthly-fees/:id/payment
Registra pagamento de mensalidade.

---

### 4.9 Endpoints de Relatórios e Dashboards

#### GET /dashboard/stats
Estatísticas gerais para o dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 35,
      "active": 33,
      "newThisMonth": 2
    },
    "referrals": {
      "total": 145,
      "pending": 23,
      "closed": 45,
      "totalValue": 1250000.00,
      "thisMonth": {
        "count": 12,
        "value": 150000.00
      }
    },
    "meetings": {
      "thisMonth": 4,
      "averageAttendance": 0.88,
      "nextMeeting": {
        "date": "2025-11-22",
        "title": "Reunião Semanal #43"
      }
    },
    "payments": {
      "pending": 5,
      "overdue": 2,
      "totalPending": 3500.00
    }
  }
}
```

---

#### GET /reports/member-performance
Relatório de performance individual.

**Query Parameters:**
- `memberId`: UUID do membro
- `startDate`, `endDate`: período
- `format`: json | pdf | excel

---

#### GET /reports/group-performance
Relatório de performance do grupo.

---

#### GET /reports/financial
Relatório financeiro.

---

## 5. Segurança

### 5.1 Autenticação e Autorização

- **JWT (JSON Web Tokens)** para autenticação
- **Role-Based Access Control (RBAC)**: admin, member, pending

```

Obrigado :)

[Gustavo Gunichi Koyama]