# Atualização: Análise Financeira com Histórico de Custos

## Visão Geral

Antes desta atualização, os custos no `FinanceiroCard` eram recalculados em tempo real usando os preços atuais dos ingredientes e os salários atuais dos funcionários. Isso significava que uma alteração de salário ou demissão afetava retroativamente todos os meses anteriores.

Esta atualização resolve esse problema e adiciona um novo sistema de registro de custos mensais com filtro próprio no card de análise financeira.

---

## Banco de Dados

### Novas tabelas

#### `gasto_ingredientes`
Armazena cada compra de ingredientes registrada manualmente pelo usuário.

| Campo         | Tipo      | Descrição                                      |
|---------------|-----------|------------------------------------------------|
| `id`          | Int (PK)  | Identificador                                  |
| `valor`       | Float     | Valor gasto nessa compra (R$)                  |
| `descricao`   | String?   | Descrição opcional (ex: "Carne", "Laticínios") |
| `mes`         | Int       | Mês da compra (1–12)                           |
| `ano`         | Int       | Ano da compra                                  |
| `restauranteId` | Int     | Vínculo com o restaurante                      |

#### `gastos_mensais`
Armazena um snapshot da folha de pagamento, capturado automaticamente no momento em que a primeira compra do mês é registrada. Garante que alterações futuras de salário não corrompam dados históricos.

| Campo           | Tipo      | Descrição                                          |
|-----------------|-----------|----------------------------------------------------|
| `id`            | Int (PK)  | Identificador                                      |
| `mes`           | Int       | Mês (1–12)                                         |
| `ano`           | Int       | Ano                                                |
| `totalSalarios` | Float     | Soma dos salários dos funcionários ativos no momento do 1º lançamento |
| `restauranteId` | Int       | Vínculo com o restaurante                          |

> **Unique**: `(mes, ano, restauranteId)` — no máximo um registro por mês/restaurante.

### Tabelas modificadas

#### `ingredientes`
- **Removido**: campo `custoPorUnidade Float` — o custo de ingredientes agora é rastreado via compras manuais em `gasto_ingredientes`, não por preço unitário no cadastro.

#### `produtos`
- **Adicionado**: campo `precoProducao Float?` — custo estimado de produção por produto (opcional, para análise de margem por item).

---

## Backend

### Novas rotas

#### `GET /api/financeiro/metricas`
Retorna os dados financeiros do período selecionado.

**Query params:**
| Param  | Obrigatório | Valores             | Exemplo         |
|--------|-------------|---------------------|-----------------|
| `tipo` | Sim         | `mensal` ou `anual` | `tipo=mensal`   |
| `mes`  | Se mensal   | 1–12                | `mes=5`         |
| `ano`  | Sim         | Ano inteiro         | `ano=2026`      |

**Resposta:**
```json
{
  "receita": 12500.00,
  "custoIngredientes": 3800.00,
  "custoSalarios": 9500.00,
  "custoTotal": 13300.00,
  "margem": -800.00,
  "gastoCadastrado": true
}
```

- `receita`: soma de `Pedido.valorTotal` com `status = FINALIZADO` no período
- `custoIngredientes`: soma de todos os `GastoIngrediente.valor` do período
- `custoSalarios`: `GastoMensal.totalSalarios` (snapshot) do período
- `gastoCadastrado`: `true` se há ao menos um lançamento ou snapshot registrado

#### `GET /api/gasto-ingredientes?mes=5&ano=2026`
Lista todas as compras registradas para o mês/ano.

**Resposta:**
```json
{
  "gastos": [
    { "id": 1, "valor": 1500.00, "descricao": "Carne", "mes": 5, "ano": 2026 },
    { "id": 2, "valor": 2300.50, "descricao": "Laticínios", "mes": 5, "ano": 2026 }
  ],
  "total": 3800.50
}
```

#### `POST /api/gasto-ingredientes`
Registra uma nova compra. Na **primeira compra do mês**, o sistema captura automaticamente o snapshot de salários.

**Body:**
```json
{
  "valor": 1500.00,
  "descricao": "Carne",
  "mes": 5,
  "ano": 2026
}
```

#### `PUT /api/gasto-ingredientes/:id`
Edita o valor ou descrição de uma compra existente.

**Body:**
```json
{
  "valor": 1800.00,
  "descricao": "Carne e Frango"
}
```

#### `DELETE /api/gasto-ingredientes/:id`
Remove uma compra.

### Rotas modificadas

#### `GET /api/pedidos/metricas`
Simplificada — não retorna mais o bloco `financeiro`. Retorna apenas os KPIs operacionais:

```json
{
  "faturamento":  { "valor": 0, "variacao": 0 },
  "pedidos":      { "valor": 0, "variacao": 0 },
  "ticketMedio":  { "valor": 0, "variacao": 0 },
  "tempoPreparo": { "valor": 0, "variacao": 0 }
}
```

### Novos arquivos backend

| Arquivo | Função |
|---------|--------|
| `prisma/schema/gasto_ingrediente.prisma` | Modelo da tabela de compras |
| `prisma/schema/gasto_mensal.prisma` | Modelo do snapshot mensal de salários |
| `src/services/gasto_ingrediente.service.ts` | CRUD de compras + trigger do snapshot |
| `src/controllers/gasto_ingrediente.controller.ts` | Handlers HTTP |
| `src/routes/gasto_ingrediente/gasto_ingrediente.routes.ts` | Rotas CRUD |
| `src/services/financeiro.service.ts` | Agrega receita + compras + salários |
| `src/controllers/financeiro.controller.ts` | Handler do endpoint financeiro |
| `src/routes/financeiro/financeiro.routes.ts` | Rota GET /metricas |

---

## Frontend

### FinanceiroCard — agora autocontido

O componente `FinanceiroCard` deixou de receber props externas e passou a gerenciar seu próprio estado e dados.

**Antes:**
```jsx
<FinanceiroCard data={financeiroData} deltaLabel={deltaLabel} />
```

**Depois:**
```jsx
<FinanceiroCard />
```

#### Filtro próprio (Mensal / Anual)

O card tem seus próprios controles de período, independentes do filtro global do dashboard (que continua controlando apenas os KPI cards).

- **Mensal**: usuário seleciona mês (Janeiro–Dezembro) + ano
- **Anual**: usuário seleciona apenas o ano
- Padrão: mês e ano atuais em modo Mensal

#### Modal "Lançar custos" (apenas no modo Mensal)

Acessível pelo botão "+ Lançar custos" no header do card. Permite:

- **Listar** todas as compras do mês selecionado com valor e descrição
- **Adicionar** nova compra (valor obrigatório, descrição opcional)
- **Editar** inline qualquer compra existente
- **Excluir** qualquer compra
- **Ver** o total das compras do mês
- **Ver** o snapshot da folha de pagamento registrado para o mês

#### Display dos valores (sem variações)

O card exibe apenas valores absolutos do período — sem badges de variação percentual, pois o objetivo é análise de custo absoluto, não comparação de períodos.

| Métrica              | Origem                                      |
|----------------------|---------------------------------------------|
| Receita              | Soma dos pedidos finalizados no período     |
| Custo Ingredientes   | Soma das compras registradas no período     |
| Custo Salários       | Snapshot salvo no 1º lançamento do mês      |
| Custo Total          | Ingredientes + Salários                     |
| Margem Bruta         | Receita − Custo Total                       |
| % Margem             | (Margem ÷ Receita) × 100                   |
| Barra de composição  | Proporção Ingredientes vs Salários no custo |

#### Banner informativo

Quando nenhuma compra foi registrada para o mês/ano selecionado, o card exibe:
> "Nenhuma compra registrada para Maio/2026. Clique em 'Lançar custos' para adicionar."

### Novos arquivos frontend

| Arquivo | Função |
|---------|--------|
| `src/services/financeiro.service.js` | Chamada ao `GET /financeiro/metricas` |
| `src/hooks/useFinanceiro.js` | Estado + fetch dos dados financeiros |
| `src/services/gasto_ingrediente.service.js` | CRUD de compras |
| `src/hooks/useGastoIngrediente.js` | Estado do modal de compras (lista, add, edit, remove) |

---

## Fluxo completo: como os custos são calculados

```
Usuário abre "Lançar custos" → Modal do mês selecionado

Usuário adiciona compra (ex: "Carne, R$ 1.500")
    │
    ├─ POST /gasto-ingredientes → salva na tabela gasto_ingredientes
    │
    └─ É o 1º lançamento do mês?
          ├─ SIM → sistema captura snapshot:
          │        soma salários de todos os funcionários active=true
          │        salva em gastos_mensais (totalSalarios = R$ 9.500)
          └─ NÃO → GastoMensal já existe, snapshot não é recriado

Usuário fecha o modal
    │
    └─ FinanceiroCard refaz a query:
          GET /financeiro/metricas?tipo=mensal&mes=5&ano=2026
          │
          ├─ receita = SUM(pedidos FINALIZADO no mês)
          ├─ custoIngredientes = SUM(gasto_ingredientes do mês)
          ├─ custoSalarios = gastos_mensais.totalSalarios do mês
          └─ margem = receita - (custoIngredientes + custoSalarios)
```

### Preservação histórica

| Evento futuro                    | Impacto nos meses anteriores |
|----------------------------------|------------------------------|
| Funcionário recebe aumento       | Nenhum — snapshot já salvo   |
| Funcionário é demitido           | Nenhum — snapshot já salvo   |
| Preço de ingrediente muda        | Nenhum — compras já registradas com valor no momento da compra |
| Novo funcionário contratado      | Afeta apenas snapshots futuros |

---

## Seed de dados

O `seed.ts` foi atualizado para remover a referência ao campo `custoPorUnidade` (que foi removido do modelo `Ingrediente`). Os ingredientes agora são criados sem esse campo.
