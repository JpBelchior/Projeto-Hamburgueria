# 🍔 Projeto Hamburgueria — Setup

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado e rodando
- [Node.js](https://nodejs.org/) instalado

---

## 1. Subir o banco de dados

Na raiz do projeto, suba os containers com Docker:

```bash
docker compose up -d
```

> O `-d` roda em background. Use `docker compose logs -f` para acompanhar os logs.

---

## 2. Instalar dependências do backend

```bash
cd backend
npm install
```

---

## 3. Configurar variáveis de ambiente

Crie um arquivo `.env` dentro de `/backend` com base no `.env.example`:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/hamburgueria"
```

---

## 4. Gerar o Prisma Client

```bash
npx prisma generate
```

---

## 5. Executar as migrations

```bash
npx prisma migrate dev --name init
```

---

## 6. Popular o banco (seed)

```bash
npx prisma db seed
```

---

## 7. Criar novas migrations

Sempre que alterar o `schema.prisma`, crie uma nova migration:

```bash
npx prisma migrate dev --name nome_da_alteracao
```

> Exemplos de nomes: `add_user_table`, `add_price_to_product`, `remove_field_description`

---

## 8. Voltar uma migration (rollback)

O Prisma não possui rollback automático, mas há algumas formas de reverter:

**Opção 1 — Resetar todo o banco** (apaga tudo e recria do zero):
```bash
npx prisma migrate reset
```
> ⚠️ Isso apaga todos os dados e reaplicar todas as migrations + seed.

**Opção 2 — Voltar manualmente** (sem apagar os dados):

1. Desfaça as alterações no `schema.prisma`
2. Delete o arquivo da migration indesejada em `prisma/migrations/`
3. Rode novamente:
```bash
npx prisma migrate dev
```

**Opção 3 — Marcar uma migration como revertida** (produção):
```bash
npx prisma migrate resolve --rolled-back "nome_da_migration"
```

---

## ✅ Resumo dos comandos

```bash
# Na raiz do projeto
docker compose up -d

# Em /backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Criar nova migration após alterar o schema
npx prisma migrate dev --name nome_da_alteracao

# Resetar banco (apaga tudo e recria)
npx prisma migrate reset
```