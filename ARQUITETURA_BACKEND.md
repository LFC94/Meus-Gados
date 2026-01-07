# Arquitetura Backend - Pastas Drizzle e Shared

## 📋 Visão Geral

O projeto Meus Gados foi criado com suporte opcional para backend. Embora o app atual funcione **100% localmente** (sem servidor), as pastas `drizzle` e `shared` estão preparadas para quando você precisar de funcionalidades de servidor no futuro.

---

## 🗂️ Estrutura do Projeto

```
meus-gados/
├── app/                    ← Código do aplicativo móvel (React Native)
├── components/             ← Componentes reutilizáveis
├── lib/                    ← Utilitários e helpers
├── hooks/                  ← React hooks customizados
├── types/                  ← Tipos TypeScript locais
│
├── server/                 ← 🔴 BACKEND (opcional, não usado atualmente)
│   ├── _core/             ← Código framework (não editar)
│   ├── db.ts              ← Funções de banco de dados
│   ├── routers.ts         ← APIs tRPC
│   ├── storage.ts         ← Upload para S3
│   └── README.md          ← Documentação do backend
│
├── drizzle/                ← 🔴 BANCO DE DADOS (opcional, não usado atualmente)
│   ├── schema.ts          ← Definição das tabelas
│   ├── relations.ts       ← Relacionamentos entre tabelas
│   ├── migrations/        ← Histórico de mudanças
│   └── meta/              ← Metadados do Drizzle
│
├── shared/                 ← 🔴 CÓDIGO COMPARTILHADO (opcional)
│   ├── types.ts           ← Tipos compartilhados entre app e servidor
│   ├── const.ts           ← Constantes compartilhadas
│   └── _core/             ← Código framework (não editar)
│
└── package.json            ← Dependências do projeto
```

---

## 🔴 Por que essas pastas existem?

Quando você criou o projeto com `webdev_init_project`, o template incluiu suporte para:

1. **Backend com Node.js + Express**
2. **Banco de dados PostgreSQL**
3. **API com tRPC**
4. **Autenticação de usuários**

Essas funcionalidades são **opcionais** e você **não precisa usá-las** se o app funcionar localmente.

---

## 📁 Pasta: `drizzle/`

### O que é Drizzle?

**Drizzle** é um ORM (Object-Relational Mapping) TypeScript para bancos de dados SQL. Ele permite definir tabelas e fazer queries de forma segura e tipada.

### Arquivos em `drizzle/`:

#### 1. **schema.ts** - Definição das Tabelas
```typescript
// Exemplo de como seria definir uma tabela
import { pgTable, serial, varchar, date } from "drizzle-orm/pg-core";

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  number: varchar("number").notNull(),
  name: varchar("name"),
  birthDate: date("birth_date"),
  // ... mais campos
});
```

**Quando usar:** Se você quiser sincronizar dados com um servidor PostgreSQL.

#### 2. **relations.ts** - Relacionamentos
```typescript
// Define como as tabelas se relacionam
export const animalsRelations = relations(animals, ({ many }) => ({
  vaccines: many(vaccines),
  diseases: many(diseases),
}));
```

**Quando usar:** Quando precisar de relacionamentos entre tabelas (um animal tem muitas vacinas).

#### 3. **migrations/** - Histórico de Mudanças
```
migrations/
├── 0000_elite_eternals.sql  ← Primeira versão do banco
└── meta/
    └── _journal.json        ← Histórico de migrações
```

**O que é:** Cada vez que você muda o schema, uma nova migração é criada. Isso permite versionamento do banco de dados.

**Quando usar:** Quando você tiver um servidor e precisar atualizar o banco sem perder dados.

### 📊 Exemplo Prático: Adicionar Tabela de Vacinas

Se você quisesse usar o backend, adicionaria em `drizzle/schema.ts`:

```typescript
import { pgTable, serial, varchar, date, integer } from "drizzle-orm/pg-core";

export const vaccines = pgTable("vaccines", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").references(() => animals.id),
  name: varchar("name").notNull(),
  appliedDate: date("applied_date").notNull(),
  nextDose: date("next_dose"),
  batch: varchar("batch"),
});
```

Depois rodaria:
```bash
pnpm db:push  # Cria a migração automaticamente
```

---

## 🔄 Pasta: `shared/`

### O que é Shared?

**Shared** é uma pasta para código que é **usado tanto no app quanto no servidor**. Evita duplicação de código.

### Arquivos em `shared/`:

#### 1. **types.ts** - Tipos Compartilhados
```typescript
// Tipos que app e servidor usam juntos
export interface Animal {
  id: string;
  number: string;
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
}

export interface Vaccine {
  id: string;
  animalId: string;
  name: string;
  appliedDate: string;
  nextDose?: string;
  batch: string;
}
```

**Vantagem:** Se você mudar um tipo, muda em um único lugar e ambas as partes (app e servidor) ficam sincronizadas.

#### 2. **const.ts** - Constantes Compartilhadas
```typescript
// Constantes usadas em ambos os lados
export const CATTLE_BREEDS = [
  "Nelore",
  "Angus",
  "Brahman",
  "Guzerá",
];

export const DISEASE_RESULTS = [
  "in_treatment",
  "cured",
  "death",
] as const;
```

**Vantagem:** Garante que app e servidor usam os mesmos valores.

#### 3. **_core/** - Código Framework
Não edite! É gerenciado automaticamente pelo framework.

---

## 🖥️ Pasta: `server/`

### O que é?

**Server** é o backend Node.js que roda no servidor. Contém:

### Arquivos em `server/`:

#### 1. **db.ts** - Funções de Banco de Dados
```typescript
// Exemplo de função para buscar animal
import { db } from "@/server/_core/db";
import { animals } from "@/drizzle/schema";

export async function getAnimal(id: string) {
  return await db
    .select()
    .from(animals)
    .where(eq(animals.id, id));
}
```

#### 2. **routers.ts** - APIs tRPC
```typescript
// Exemplo de API para adicionar animal
import { router, publicProcedure } from "@/server/_core/trpc";
import { z } from "zod";

export const appRouter = router({
  animal: {
    create: publicProcedure
      .input(z.object({
        number: z.string(),
        name: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Salva no banco de dados
        return await db.insert(animals).values(input);
      }),
  },
});
```

#### 3. **storage.ts** - Upload para S3
```typescript
// Funções para fazer upload de arquivos
export async function uploadFile(file: File) {
  // Faz upload para S3
}
```

---

## 🔀 Como Funciona a Comunicação App ↔ Server

### Atualmente (Sem Backend):
```
┌─────────────────────┐
│   App (React Native)│
│                     │
│  AsyncStorage       │ ← Dados salvos localmente
│  (JSON no celular)  │
└─────────────────────┘
```

### Com Backend (Futuro):
```
┌─────────────────────┐
│   App (React Native)│
│                     │
│  tRPC Client        │ ← Faz chamadas HTTP
│  (lib/trpc.ts)      │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  Server (Node.js)   │
│                     │
│  tRPC Router        │ ← Recebe requisições
│  (server/routers.ts)│
└──────────┬──────────┘
           │ SQL
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  (Banco de Dados)   │
└─────────────────────┘
```

---

## 🚀 Quando Usar Backend?

### ❌ NÃO precisa de backend se:
- Dados ficam apenas no celular
- Não precisa sincronizar entre dispositivos
- Não precisa de autenticação de usuários
- App é para uso pessoal

### ✅ PRECISA de backend se:
- Múltiplos usuários compartilham dados
- Dados precisam sincronizar entre dispositivos
- Precisa fazer backup na nuvem
- Precisa de autenticação
- Precisa de processamento no servidor

---

## 📚 Exemplo: Migrando para Backend

Se você decidir usar backend no futuro, aqui está o processo:

### Passo 1: Definir Tabelas em `drizzle/schema.ts`
```typescript
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  number: varchar("number").notNull(),
  name: varchar("name"),
  // ... campos
});
```

### Passo 2: Criar Funções em `server/db.ts`
```typescript
export async function createAnimal(userId: number, data: AnimalInput) {
  return await db.insert(animals).values({
    userId,
    ...data,
  });
}
```

### Passo 3: Criar APIs em `server/routers.ts`
```typescript
export const appRouter = router({
  animal: {
    create: protectedProcedure
      .input(AnimalInput)
      .mutation(async ({ input, ctx }) => {
        return await createAnimal(ctx.user.id, input);
      }),
  },
});
```

### Passo 4: Usar no App
```typescript
import { trpc } from "@/lib/trpc";

const { mutate } = trpc.animal.create.useMutation();

const handleSave = async (data) => {
  mutate(data, {
    onSuccess: (result) => {
      console.log("Animal criado:", result);
    },
  });
};
```

---

## 🔐 Segurança

### Dados Locais (Atual):
- ✅ Privado: Apenas no seu dispositivo
- ✅ Seguro: Sem servidor para hackear
- ❌ Sem backup: Se perder o celular, perde tudo

### Com Backend:
- ✅ Backup na nuvem
- ✅ Sincroniza entre dispositivos
- ⚠️ Requer autenticação segura
- ⚠️ Dados no servidor (conformidade LGPD/GDPR)

---

## 📖 Documentação Completa

Para mais detalhes sobre o backend, leia:
- `server/README.md` - Documentação completa do servidor
- `drizzle/schema.ts` - Exemplo de schema
- `lib/trpc.ts` - Cliente tRPC

---

## ✅ Resumo

| Pasta | Propósito | Usar Quando | Status Atual |
|-------|-----------|------------|------------|
| **drizzle/** | Definir banco de dados | Precisa sincronizar dados | ❌ Não usado |
| **shared/** | Código compartilhado | App + Server | ⚠️ Pronto mas não usado |
| **server/** | Backend Node.js | Precisa de servidor | ❌ Não usado |

**Seu app atual é 100% local e funciona perfeitamente sem essas pastas. Elas estão lá para quando você precisar escalar!**

---

## 🎯 Próximos Passos

Se você quiser adicionar backend no futuro:

1. Leia `server/README.md` completamente
2. Configure um banco PostgreSQL
3. Defina as tabelas em `drizzle/schema.ts`
4. Crie as APIs em `server/routers.ts`
5. Use `trpc` no app para chamar as APIs

Mas por enquanto, **seu app local é perfeito para gerenciar gado!** 🐄
