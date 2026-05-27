# Projeto Hamburgueria

Sistema de gerenciamento de hamburgueria com controle de funcionários, pedidos, produtos, ingredientes e combos. Construído com React no frontend e Node.js/Express no backend, banco MySQL via Prisma.

---

## Como iniciar o projeto

### Pré-requisitos
- Docker rodando (para o banco MySQL)
- Node.js instalado

### 1. Subir o banco de dados
```bash
docker-compose up -d
```
Isso sobe o MySQL na porta `3306` com o banco `hamburgueria` já criado automaticamente.

### 2. Iniciar o backend
```bash
cd backend
npm install
npm run dev
```
Roda em `http://localhost:3001`

### 3. Iniciar o frontend
```bash
cd frontend
npm install
npm start
```
Roda em `http://localhost:3000`

---

## Usuários de teste

| Nome | Email | Senha | Role |
|---|---|---|---|
| João Pedro | gerente@teste.com | 123456 | GERENTE |
| Maria | atendente@teste.com | 123456 | — |
| Giovana | giovana@gmail.com | — | — |

> Maria e Giovana ainda não têm role atribuída no banco.

---

## Arquitetura geral

```
frontend (React)  →  backend (Express/Node)  →  MySQL (Docker)
     :3000               :3001                     :3306
```

---

## Backend

**Tecnologias:** Express 5, TypeScript, Prisma 6, MySQL, JWT, bcryptjs, Helmet, CORS

### Rotas disponíveis

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | /api/auth/login | Login | Não |
| POST | /api/auth/refresh | Renovar token | Não |
| POST | /api/auth/logout | Logout | Sim |
| GET | /api/auth/me | Dados do usuário logado | Sim |
| GET | /api/roles | Listar roles | Não |
| GET | /api/funcionarios | Listar funcionários | Sim |
| GET | /api/funcionarios/:id | Buscar funcionário | Sim |
| POST | /api/funcionarios | Criar funcionário | Sim |
| PUT | /api/funcionarios/:id | Atualizar funcionário | Sim |
| PATCH | /api/funcionarios/:id/toggle | Ativar/desativar | Sim |
| DELETE | /api/funcionarios/:id | Deletar permanente | Sim |

### Fluxo de autenticação

1. Login retorna `token` (30 min) + `refreshToken` (7 dias)
2. Cada requisição envia `Bearer <token>` no header
3. Quando o token expira, o frontend renova automaticamente via `/api/auth/refresh`
4. Logout invalida o refreshToken no banco

### Estrutura de pastas

```
backend/src/
├── controllers/        → auth, roles
├── routes/             → auth, roles
├── middleware/         → autenticação JWT, verificação de permissão
├── funcionario/        → controller, service, routes, dto
├── helpers/            → geração e verificação de tokens JWT
├── dto/                → tipos de entrada (login, funcionário)
└── shared/             → context por requisição (AsyncLocalStorage)

backend/prisma/
├── schema/             → arquivos .prisma por entidade
└── seed.ts             → dados iniciais (não executado ainda)
```

---

## Frontend

**Tecnologias:** React 19, React Router 7, Zustand, Axios, Tailwind CSS 4, Lucide React

### Páginas implementadas

| Rota | Página | Role necessária |
|---|---|---|
| `/` | Login | — |
| `/Dashboard` | Dashboard do gerente | GERENTE |
| `/Dashboard/funcionarios` | Gestão de funcionários | GERENTE |
| `/Dashboard/pedidos` | Pedidos (placeholder) | GERENTE |
| `/Dashboard/produtos` | Produtos (placeholder) | GERENTE |
| `/Dashboard/ingredientes` | Ingredientes (placeholder) | GERENTE |
| `/Dashboard/combos` | Combos (placeholder) | GERENTE |
| `/Dashboard/metricas` | Métricas (placeholder) | GERENTE |
| `/DashboardFuncionario` | Dashboard do atendente (placeholder) | ATENDENTE |

> Páginas marcadas como "placeholder" têm rota e proteção funcionando, mas sem conteúdo real ainda.

### Gerenciamento de estado (Zustand)

O `useAuthStore` centraliza o estado de autenticação:
```js
{
  user: { id, email, name, roles[], permissions[] },
  login(email, password),
  logout(),
  fetchMe(),
  hasPermission(permission),
  isAuthenticated()
}
```

### Serviços (Axios)

Todos os serviços usam uma instância Axios configurada em `api.js` que:
- Injeta o Bearer token automaticamente em todas as requisições
- Intercepta 401 e tenta renovar o token antes de redirecionar pro login

### Estrutura de pastas

```
frontend/src/
├── pages/              → Login, Funcionarios
├── components/
│   ├── Layouts/        → DashboardLayout (sidebar + outlet)
│   ├── Login/          → LogoHeader, MetricCard, footer
│   ├── Funcionario/    → FuncionarioCard, FuncionarioForm
│   └── Ui/             → Button, Modal, Avatar, SearchBar, StatusBadge, PageHeader
├── routes/             → AppRoutes, ProtectedRoute
├── store/              → useAuthStore (Zustand)
├── services/           → api, auth, funcionario, role
├── hooks/              → useLogin, useFuncionario, buttonPassword
├── utils/              → formatação de data, moeda, telefone
└── config/             → navegação do sidebar
```

---

## Banco de dados

### Diagrama de relacionamentos

```
User ──────────── UserRole ──── Role ──── RolePermission ──── Permission ──── Resource
 │                                                                                
 └── Funcionario ──── Pedido ──── PedidoItem ──┬── Produto ──── ProdutoIngrediente ──── Ingrediente
                                               └── Combo  ──── ComboProduto    ────────┘
```

### Tabelas e descrição

| Tabela | Descrição |
|---|---|
| `users` | Usuários do sistema (login, senha, CPF, telefone) |
| `funcionarios` | Dados profissionais do funcionário (cargo, salário, admissão) |
| `roles` | Papéis do sistema (GERENTE, ATENDENTE) |
| `user_roles` | Vínculo entre usuário e role |
| `permissions` | Ações permitidas (criar, listar, editar, deletar) por recurso |
| `resources` | Recursos do sistema (pedido, produto, usuario, etc.) |
| `role_permissions` | Vínculo entre role e permissão |
| `pedidos` | Pedidos (status, pagamento, cliente, valor total) |
| `pedido_itens` | Itens de cada pedido (produto ou combo, quantidade, preço) |
| `produtos` | Produtos do cardápio (categoria, preço, desconto, disponibilidade) |
| `ingredientes` | Ingredientes em estoque (quantidade, unidade, custo) |
| `produto_ingredientes` | Ingredientes usados por produto (com quantidade) |
| `combos` | Conjuntos de produtos com preço especial |
| `combo_produtos` | Produtos que compõem cada combo |

### Enums

| Enum | Valores |
|---|---|
| `Cargo` | ATENDENTE, COZINHEIRO, CAIXA |
| `CategoriaProduct` | PRINCIPAL, ACOMPANHAMENTO, BEBIDA, SOBREMESA |
| `StatusPedido` | ABERTO, EM_PREPARO, FINALIZADO, CANCELADO |
| `FormaPagamento` | DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, PIX |
| `UnidadeMedida` | KG, G, LITRO, ML, UNIDADE |

### Migrações aplicadas

| Migração | O que fez |
|---|---|
| `20260227000935_init` | Schema inicial completo |
| `20260306112959_add_cpf_to_users` | Campo CPF no user |
| `20260306113256_adicionando_cpf` | Ajuste no CPF |
| `20260307151456_add_telefone_user` | Campo telefone no user |
| `20260307185149_rbac` | Tabelas de roles, permissions e resources |

---

## O que está implementado vs. o que falta

### Implementado
- [x] Autenticação completa (login, logout, refresh token, proteção de rotas)
- [x] RBAC — roles, permissões e middleware de autorização
- [x] CRUD completo de funcionários (frontend + backend)
- [x] Layout do dashboard com sidebar e navegação
- [x] Schema do banco para todas as entidades do sistema

### Falta implementar (schema pronto, tela em branco)
- [ ] Dashboard do atendente (`/DashboardFuncionario`)
- [ ] Pedidos
- [ ] Produtos
- [ ] Ingredientes / Estoque
- [ ] Combos
- [ ] Métricas
- [ ] Atribuição de role via interface (hoje é feito direto no banco)

---

## Variáveis de ambiente

**backend/.env**
```
DATABASE_URL="mysql://root:meuprojetonovo123a@localhost:3306/hamburgueria"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**frontend** — criar `.env` na raiz do frontend se necessário:
```
REACT_APP_API_URL=http://localhost:3001/api
```
