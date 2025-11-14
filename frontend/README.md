# Frontend - Plataforma de Gestão de Networking

Interface web desenvolvida com Next.js 14, React e TailwindCSS para a plataforma de gestão de networking.

## Stacks Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Linguagem type-safe
- **TailwindCSS** - Framework CSS
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query (React Query)** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend rodando em http://localhost:3000

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente


```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ajuste se o backend estiver em outra porta.

### 3. Iniciar em modo desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3001`

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Estilos globais
│   │   ├── login/                # Página de login
│   │       ├──componentes/       # Componentes individuais
│   │   ├── apply/                # Formulário de intenção (público)
│   │   └── dashboard/            # Área autenticada
│   │       ├── page.tsx          # Dashboard principal
│   │       ├── referrals/        # Módulo de indicações
│   │       │   ├── page.tsx      # Listar indicações
│   │       │   ├── new/          # Criar indicação
│   │       │   └── [id]/         # Detalhes da indicação
│   │       └── members/          # Módulo de membros
│   ├── components/
│   │   ├── providers.tsx         # React Query Provider
│   │   └── ui/                   # Componentes UI reutilizáveis
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── api.ts                # Cliente Axios configurado
│   │   └── utils.ts              # Funções utilitárias
│   └── types/                    # TypeScript types
│       ├── user.ts
│       ├── member.ts
│       └── referral.ts
├── public/                       # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (porta 3001)
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # ESLint
npm run type-check   # TypeScript check
```


## 📚 Documentos

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Hook Form Docs](https://react-hook-form.com/)

---



