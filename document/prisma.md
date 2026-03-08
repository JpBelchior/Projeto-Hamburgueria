# 🗄️ Prisma — Manual de Comandos Úteis

Referência rápida para migrations e seeds no Prisma ORM.

---

## 📋 Pré-requisitos

Certifique-se de que o arquivo `.env` contém a variável de conexão com o banco:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## 🔄 Migrations

### Criar e aplicar uma migration (desenvolvimento)
```bash
npx prisma migrate dev --name nome_da_migration
```
> Cria o arquivo SQL em `prisma/migrations/` e aplica no banco automaticamente.

---

### Aplicar migrations pendentes (produção)
```bash
npx prisma migrate deploy
```
> Aplica todas as migrations ainda não executadas. Ideal para CI/CD.

---

### Ver status das migrations
```bash
npx prisma migrate status
```
> Lista quais migrations foram aplicadas e quais estão pendentes.

---

### Resetar o banco ⚠️
```bash
npx prisma migrate reset
```
> **Apaga todos os dados**, recria o banco do zero e reaaplica todas as migrations.
> Também roda a seed automaticamente ao final.
> **Use apenas em desenvolvimento!**

---

### Gerar o Prisma Client
```bash
npx prisma generate
```
> Deve ser rodado sempre que houver mudanças no `schema.prisma`.

---

## 🌱 Seed

### Rodar a seed
```bash
npx prisma db seed
```

---

### Configuração no `package.json`

Declare o arquivo de seed no `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Alternativas para projetos com `tsx` ou `esm`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

---

### Exemplo de `prisma/seed.ts`

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@email.com',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 🗂️ Fluxo de Desenvolvimento

```
1. Editar schema.prisma
        ↓
2. npx prisma migrate dev --name descricao
        ↓
3. npx prisma generate
        ↓
4. npx prisma db seed   (se necessário)
```

---

## 🚀 Fluxo de Produção

```
1. npx prisma migrate deploy
        ↓
2. npx prisma generate
```

---

## 📌 Referência Rápida

| Comando | Descrição |
|---|---|
| `prisma migrate dev --name <nome>` | Cria e aplica migration em dev |
| `prisma migrate deploy` | Aplica migrations em produção |
| `prisma migrate status` | Exibe status das migrations |
| `prisma migrate reset` | Reseta o banco (apenas dev) |
| `prisma generate` | Gera o Prisma Client |
| `prisma db seed` | Executa a seed |
| `prisma studio` | Abre interface visual do banco |

---

> 📚 Documentação oficial: [https://www.prisma.io/docs](https://www.prisma.io/docs)
