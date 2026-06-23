# Projeto Hamburgueria

Sistema de gestão para restaurantes: pedidos, cardápio, estoque, finanças e funcionários.

## Arquitetura

```
backend/   Express + TypeScript + Prisma (MySQL)
frontend/  React 19 + Tailwind (via index.css) + Zustand + Recharts
```

A comunicação é via REST. O schema do Prisma é dividido em múltiplos arquivos em `backend/prisma/schema/`.

## Como rodar

```bash
# Backend (porta 3001 por padrão)
cd backend && npm run dev

# Frontend (porta 3000)
cd frontend && npm start
```

O frontend lê `REACT_APP_API_URL` do `.env` para apontar para o backend.

## Backend

### Estrutura
```
src/
  controllers/   Handlers HTTP — recebem req/res, delegam para services
  services/      Lógica de negócio + queries Prisma
  routes/        Express routers
  dto/           Interfaces TypeScript para request/response
  middleware/    Auth JWT + RBAC
  utils/
    request-context.ts   AsyncLocalStorage com user + restauranteId da requisição
    prisma-error.ts      Traduz PrismaClientKnownRequestError para mensagens legíveis
    dateRange.ts         Helpers de intervalo de datas para métricas
```

### Padrões
- Cada service recebe o `restauranteId` via `RequestContext.getRestauranteId()` — nunca confiar no body do request para isso.
- Erros do Prisma são tratados em `prisma-error.ts`; não repetir lógica de tratamento nos services.
- DTOs vivem em `src/dto/` e são as únicas interfaces tipadas entre controller e service.
- O schema split do Prisma requer rodar `prisma generate` após qualquer mudança nos arquivos `.prisma`.

### Convenção de nomes no service
- Funções exportadas no infinitivo em PT-BR: `criarPromocao`, `atualizarPromocao`, `buscarPromocao`.
- Selects reutilizáveis ficam em constantes no topo do arquivo (`promocaoSelect`, etc.).

## Frontend

### Estrutura
```
src/
  components/    Componentes por domínio (Combos/, Pedidos/, etc.) + Ui/ compartilhados
  hooks/         Hooks por domínio — lógica de estado, fetch, drawer
  services/      Chamadas HTTP via axios (api.js como instância base)
  utils/
    format.js    fmtBRL, deltaHint, INPUT_CLS, ACCENT, STATUS_COLOR, CAT_COLOR — fonte da verdade de formatação
  constants/     PERIODOS, ROLE_RANK, STATUS_COLS, UNIDADE_LABEL, etc.
  pages/         Páginas roteadas
  store/         Zustand stores (auth)
```

### Hooks compartilhados — use estes antes de criar novos

| Hook | Uso |
|------|-----|
| `usePeriodFetch(fn, errMsg, initial)` | Fetch simples com loading/erro/refetch. `fn` deve ser memoizada com `useCallback`. |
| `useDrawer(service, id, periodo, callbacks)` | Drawer com getById, update, toggleAtivo, delete. O `service` precisa de `getById` e `update`; os demais são opcionais (verificados com duck-typing). |

`useIngredientes`, `useProdutos`, `useCombos`, `usePromocoes` são todos wrappers de `usePeriodFetch`.
`useIngredienteDrawer`, `useProdutoDrawer`, `useComboDrawer`, `usePromocaoDrawer` são todos wrappers de `useDrawer`.

### Componentes Ui/ compartilhados — use estes antes de criar novos

| Componente | Props-chave |
|------------|-------------|
| `EntitySelector` | `disponiveis` (array com campo `nome` e `id`), `selecionadosIds`, `onAdd`, `placeholder`, `renderLabel` |
| `MixBar` | `title`, `items: { key, label, color, value }[]` |
| `ConfirmDialog` | `open`, `onClose`, `onConfirm` (pode ser async) |
| `FormField` | Wrapper de label + input |
| `Button` | Botão padrão com variantes |
| `KpiCard` | Card de métrica com delta |
| `DrawerSection` | Seção com título dentro de um drawer |

**`EntitySelector` requer que os objetos em `disponiveis` tenham o campo `nome`.** Funcionários precisam ser normalizados antes de passar: `disponiveis.filter(f => f.user?.name).map(f => ({ ...f, nome: f.user.name }))`.

### Utilitários de `format.js`
- `fmtBRL(valor)` — formata moeda BR
- `deltaHint(variacao, vsHint, { invertido })` — texto de comparação de período (usa `== null` para capturar undefined também)
- `INPUT_CLS` — classe Tailwind padrão para inputs
- `ACCENT`, `STATUS_COLOR`, `CAT_COLOR` — paleta de cores do sistema

### Padrão de serviço frontend
Todos os services expõem o mesmo contrato para `useDrawer` funcionar:
- `getById(id)` — obrigatório
- `update(id, data)` — obrigatório
- `remove(id)` — obrigatório (nome é `remove`, não `deletar`)
- `getDesempenho(id, periodo)` — opcional
- `toggleAtivo(id)` — opcional

## Bugs conhecidos (a corrigir)

### 1. `ConfirmDialog` trava aberto em erro de exclusão
`ConfirmDialog.jsx` linha 33: `await onConfirm(); onClose();` — se `onConfirm` lança, `onClose` nunca roda.

**Fix:**
```jsx
onClick={async () => { try { await onConfirm(); } finally { onClose(); } }}
```

### 2. Shadowing de `id` em `atualizarPromocao`
`promocao.service.ts`: dentro do `.map()` que cria combos/produtos, `id` se refere ao parâmetro externo (promocaoId). Qualquer futura desestruturação de `id` do DTO quebraria silenciosamente. Renomear o parâmetro para `promocaoId` tornaria explícito.

## Armadilhas frequentes

- **Quantidade mínima de ingredientes:** `min = unidade === "UNIDADE" ? 1 : 0.1` — essa lógica aparece em `ProdutoForm` e `GastoForm`. Se mudar o threshold, mudar nos dois.
- **`usePeriodFetch` e o tipo inicial:** O terceiro argumento (`initialValue`) é `[]` por padrão. Para fetches que retornam objeto (não array), passar `{}` explicitamente para evitar erros ao desestruturar antes do primeiro fetch.
- **`atualizarPromocao` sempre substitui combos/produtos:** Se o DTO enviar `combos: []`, todos os vínculos são deletados. Isso é intencional (full replace), mas a UI deve sempre enviar o estado completo, nunca um array vazio por descuido de inicialização.
- **`deltaHint` retorna string mesmo com `variacao === undefined`** (usa `== null`) — o antigo `deltaHint` em `DashboardKpis` usava `=== null` e produzia `NaN%` para undefined. O novo em `format.js` está correto.
