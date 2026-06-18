# Prisma — Referência de Comandos

Referência rápida para migrations, seeds e geração do client no projeto.

---

## Pré-requisitos

O arquivo `.env` em `backend/` precisa da variável de conexão:

```env
DATABASE_URL="mysql://user:password@localhost:3306/hamburgueria"
```

---

## Estrutura do schema

O projeto usa **multi-file schema** — todos os modelos ficam em arquivos separados dentro de `backend/prisma/schema/`:

```
prisma/schema/
  base.prisma              ← generator + datasource
  enums.prisma             ← Cargo, CategoriaProduct, StatusPedido, FormaPagamento, UnidadeMedida
  user.prisma              ← User, UserRole
  role.prisma              ← Role, RolePermission
  permission.prisma        ← Permission
  resource.prisma          ← Resource
  restaurante.prisma       ← Restaurante
  funcionario.prisma       ← Funcionario
  produto.prisma           ← Produto, ProdutoIngrediente
  ingrediente.prisma       ← Ingrediente
  combo.prisma             ← Combo, ComboProduto
  pedido.prisma            ← Pedido, PedidoItem
  gasto_ingrediente.prisma ← GastoIngrediente, GastoIngredienteIngrediente
  gasto_funcionario.prisma ← GastoFuncionario, GastoFuncionarioFuncionario
```

O `package.json` já aponta para a pasta:

```json
"prisma": {
  "schema": "prisma/schema",
  "seed": "ts-node prisma/seed.ts"
}
```

Todos os comandos `npx prisma` abaixo funcionam sem `--schema` adicional graças a essa configuração.

---

## Migrations

### Criar e aplicar (desenvolvimento)
```bash
npx prisma migrate dev --name nome_da_migration
```
Cria o arquivo SQL em `prisma/migrations/` e aplica no banco. Roda a seed automaticamente se o banco for resetado.

### Aplicar pendentes (produção)
```bash
npx prisma migrate deploy
```
Aplica todas as migrations ainda não executadas. Use em CI/CD.

### Ver status
```bash
npx prisma migrate status
```

### Resetar o banco
```bash
npx prisma migrate reset
```
**Apaga todos os dados**, recria do zero e reaaplica todas as migrations + seed. Use apenas em desenvolvimento.

---

## Client

```bash
npx prisma generate
```
Deve ser rodado após qualquer alteração em qualquer arquivo `.prisma`.

---

## Seed

```bash
npx prisma db seed
```

Exemplo mínimo de `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@email.com',
      cpf: '000.000.000-00',
      password: 'hash_aqui',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Studio (inspeção visual)

```bash
npx prisma studio
```

---

## Fluxo de desenvolvimento

```
1. Editar o arquivo .prisma correspondente
        ↓
2. npx prisma migrate dev --name descricao_da_mudanca
        ↓
3. npx prisma generate
        ↓
4. npx prisma db seed   (se necessário)
```

## Fluxo de produção

```
1. npx prisma migrate deploy
        ↓
2. npx prisma generate
```

---

## Referência rápida

| Comando | Descrição |
|---|---|
| `prisma migrate dev --name <nome>` | Cria e aplica migration em dev |
| `prisma migrate deploy` | Aplica migrations em produção |
| `prisma migrate status` | Exibe status das migrations |
| `prisma migrate reset` | Reseta o banco (apenas dev) |
| `prisma generate` | Gera o Prisma Client |
| `prisma db seed` | Executa a seed |
| `prisma studio` | Abre interface visual do banco |
