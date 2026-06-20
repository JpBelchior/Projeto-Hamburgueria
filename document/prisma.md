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






Criar a página /Dashboard/combos (atualmente placeholder) seguindo o mesmo padrão da página de Produtos. O backend tem apenas GET (listar/buscar), então precisamos completar o CRUD. A lógica de negócio central é o desconto (calculado a partir dos preços de venda dos produtos) e a distinção entre Combo (múltiplos produtos) e Promoção (1 produto com quantidade > 1, ex: "Compre 3 pague 2").

Lógica de negócio
// preço que seria cobrado sem o combo
precoNormal = sum(item.produto.precoVenda * item.quantidade)

// % de desconto que o combo oferece
desconto = round((1 - combo.preco / precoNormal) * 100)

// economia em R$
economia = precoNormal - combo.preco

// É promoção quando tem exatamente 1 produto com qtd > 1
isPromocao = combo.produtos.length === 1 && combo.produtos[0].quantidade > 1

// Label da promoção: "Compre 3 pague 2"
qtdPaga = round(combo.preco / item.produto.precoVenda)
label   = `Compre ${qtd} pague ${qtdPaga}`
Essas funções ficam em frontend/src/utils/combo.utils.js (novo arquivo).

Backend (3 arquivos)
1. backend/src/services/combo.service.ts
Adicionar precoVenda no comboSelect (dentro de produto: { select: { ..., precoVenda: true } }) — necessário para o frontend calcular descontos
Adicionar funções: criarCombo(data), atualizarCombo(id, data), deletarCombo(id), toggleAtivo(id)
criarCombo e atualizarCombo recebem { nome, preco, produtos: [{ produtoId, quantidade }] } e usam createMany/deleteMany para gerenciar a relação ComboProduto
2. backend/src/controllers/combo.controller.ts
Adicionar: criarCombo, atualizarCombo, deletarCombo, toggleAtivo (padrão igual ao funcionário/produto)

3. backend/src/routes/combo/combo.routes.ts
Adicionar:

POST   /           → criarCombo
PUT    /:id        → atualizarCombo
DELETE /:id        → deletarCombo
PATCH  /:id/toggle → toggleAtivo
Mudar listarCombos para aceitar query param incluirInativos=true.

Frontend (6 arquivos novos + 2 atualizados)
4. frontend/src/utils/combo.utils.js (novo)
Funções puras: calcPrecoNormal, calcDesconto, calcEconomia, isPromocao, getPromoLabel

5. frontend/src/services/combo.service.js (atualizar)
Adicionar: criar, update, toggleAtivo, deletar, param incluirInativos no getAll

6. frontend/src/hooks/useCombos.js (novo)
Padrão idêntico ao useProdutos.js — retorna { dados, setDados, loading, erro, refetch }

7. frontend/src/components/Combo/ComboCard.jsx (novo)
Reutiliza ItemCard. Exibe:

Badge tipo: Promoção (roxo) ou Combo (âmbar)
Preço do combo + preço normal riscado
Badge de desconto % off em verde
Label "Compre X pague Y" quando promoção
8. frontend/src/components/Combo/ComboForm.jsx (novo)
Campos: nome, preço do combo, ProdutoSelector (padrão do IngredienteSelector em ProdutoForm.jsx) Preview em tempo real: preço normal, desconto %, economia

9. frontend/src/components/Combo/ComboDrawer.jsx (novo)
Padrão idêntico ao ProdutoDrawer:

DetalheView: produtos com qtd, preço normal vs combo, desconto, label promoção
Edit/Create mode → ComboForm
Footer: deletar + ativar/desativar
10. frontend/src/pages/Combos.jsx (substituir placeholder em AppRoutes.jsx)
Estrutura igual a Produtos.jsx:

HeaderBar "Combos & Promoções"
4 KPIs (calculados localmente da lista já carregada — sem endpoint extra)
Filter (busca + tabs: Todos / Combos / Promoções)
Grid de ComboCards
ComboDrawer (estado drawerComboId)
KPI Cards (componente KpiCard existente em frontend/src/components/Ui/KpiCard.jsx)
#	Label	Ícone	Valor	Detalhe
1	Total de combos	LayoutGrid	N total	"X ativos · Y inativos"
2	Desconto médio	Percent	XX%	"média entre combos ativos"
3	Maior desconto	TrendingDown	Nome do combo	"+XX% off · R$ X,XX de economia"
4	Promoções ativas	Tag	N promoções	"X combos · Y promoções"
Todos os valores são derivados da lista já carregada usando as funções de combo.utils.js.

Verificação
POST /api/combos cria combo → resposta inclui produtos[].produto.precoVenda
Card exibe desconto calculado corretamente para combo simples
Promoção "compre 3 pague 2": 1 produto, qtd=3, preco=2×precoVenda → badge roxo + label correto
Drawer: criar, editar, desativar, deletar funcionando e refletindo na lista
KPIs atualizam ao criar/editar/deletar (derivados do mesmo array 