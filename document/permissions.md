# Sistema de Permissões (RBAC)

## Visão Geral

O sistema usa **Role-Based Access Control (RBAC)** dinâmico — perfis e permissões são gerenciados pelo banco de dados, sem hardcode no código.

```
User → UserRole → Role → RolePermission → Permission → Resource
```

Exemplo: `João → GERENTE → pedido:criar, pedido:listar`

---

## Roles existentes e hierarquia de rank

| Role | Rank | Descrição |
|------|------|-----------|
| `ADMIN` | 100 | Administrador global do SaaS — bypass total |
| `ADMIN_RESTAURANTE` | 80 | Proprietário do restaurante — bypass total |
| `GERENTE` | 60 | Gerência operacional — verificado por permissions |
| `ATENDENTE` | 20 | Acesso operacional — verificado por permissions |
| `COZINHEIRO` | 20 | (rank igual a ATENDENTE) |
| `CAIXA` | 20 | (rank igual a ATENDENTE) |

> **Cargo ≠ Role.** `Cargo` (enum: `ATENDENTE`, `COZINHEIRO`, `CAIXA`) é dado de RH do funcionário — não determina acesso ao sistema. `Role` é o papel de acesso, atribuído explicitamente via `user_roles`.

---

## Regras de autoridade sobre roles

1. Um usuário **não pode alterar a própria role**.
2. Um usuário só pode **editar** funcionários com rank **estritamente menor** que o seu.
3. Um usuário só pode **atribuir** a outro uma role com rank **menor ou igual** ao seu — não pode promover alguém além do próprio nível.

---

## Estrutura do banco

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `roles` | Perfis (ADMIN, ADMIN_RESTAURANTE, GERENTE, ATENDENTE…) |
| `resources` | Entidades protegidas: `pedido`, `produto`, `usuario`, `combo` |
| `permissions` | Ação sobre recurso: `{ action, resourceId }` |
| `user_roles` | Relaciona usuário ↔ role |
| `role_permissions` | Relaciona role ↔ permission |

### Formato da permissão
```
{resource.name}:{permission.action}
ex: "pedido:criar", "produto:listar", "usuario:deletar"
```

Actions disponíveis: `criar`, `listar`, `editar`, `deletar`

---

## Como a role é montada no login

No login, o backend busca o usuário com roles e permissions aninhadas:

```typescript
// auth.controller.ts — login
const roles = user.roles.map((ur) => ur.role.name);
const permissions = user.roles.flatMap((ur) =>
  ur.role.permissions.map(
    (rp) => `${rp.permission.resource.name}:${rp.permission.action}`
  )
);

// JWT carrega: { id, email, name, roles, restauranteId }
// Resposta inclui permissions separado (não vai no token)
res.json({ token, refreshToken, user: { ...payload, permissions } });
```

O frontend salva `token`, `refreshToken` e `user` (com `roles` e `permissions`) no `localStorage`. O Zustand store (`useAuthStore`) inicializa lendo do `localStorage`.

---

## Backend

### 1. Bypass automático

`ADMIN` e `ADMIN_RESTAURANTE` passam por todas as rotas sem verificação de permission:

```typescript
// permission.middleware.ts
if (userRoles.includes("ADMIN") || userRoles.includes("ADMIN_RESTAURANTE")) {
  next();
  return;
}
```

Para os demais roles, o middleware consulta `role_permissions` no banco.

### 2. Protegendo uma rota

Toda rota protegida precisa de `authenticate` **antes** de `requirePermission`:

```typescript
// exemplo: funcionario.routes.ts
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

router.get("/",       authenticate, requirePermission("usuario", "listar"), FuncionarioController.getAll);
router.post("/",      authenticate, requirePermission("usuario", "criar"),  FuncionarioController.create);
router.put("/:id",    authenticate, requirePermission("usuario", "editar"), FuncionarioController.update);
router.delete("/:id", authenticate, requirePermission("usuario", "deletar"), FuncionarioController.hardDelete);
```

### 3. Criando resource + permissions no seed

```typescript
// prisma/seed.ts
const rPedido = await prisma.resource.create({ data: { name: "pedido" } });

await Promise.all(
  ["criar", "listar", "editar", "deletar"].map((a) =>
    prisma.permission.create({ data: { action: a, resourceId: rPedido.id } })
  )
);
```

### 4. Atribuindo permissions a uma role

```typescript
const perm = await prisma.permission.findFirst({
  where: { action: "criar", resource: { name: "pedido" } }
});

await prisma.rolePermission.create({
  data: { roleId: roleGerente.id, permissionId: perm.id, assignedBy: "seed" }
});
```

### 5. Atribuindo role a um usuário (criação de funcionário)

```typescript
await prisma.user.create({
  data: {
    name: "Ana",
    email: "ana@loja.com",
    cpf: "111.111.111-11",
    password: await bcrypt.hash("senha", 10),
    roles: {
      create: { roleId: roleGerente.id, assignedBy: "admin" }
    },
    funcionario: {
      create: { cargo: Cargo.CAIXA, salario: 4000, restauranteId }
    }
  }
});
```

Via API: `POST /funcionarios` com body `{ ..., roles: [{ id: 3 }] }`.

### 6. Atualizando a role de um funcionário

`PUT /funcionarios/:id` com body `{ roles: [{ id: novaRoleId }] }`.

O service valida:
- Não é o próprio usuário
- Nova role tem rank ≤ rank do ator
- Deleta `user_roles` antigos e cria os novos em transaction

---

## Frontend

### 1. Redirecionamento após login

```javascript
// useLogin.js
const destination = user.roles.includes("GERENTE") ? "/Dashboard" : "/DashboardFuncionario";
navigate(destination);
```

### 2. Protegendo rotas com `ProtectedRoute`

`ProtectedRoute` verifica **role**, não permission:

```jsx
// AppRoutes.jsx
<Route
  path="/Dashboard"
  element={
    <ProtectedRoute requiredRole="GERENTE">
      <DashboardLayout />
    </ProtectedRoute>
  }
>
```

Lógica interna:
- Sem token → redireciona para `/`
- Role incorreta → redireciona para o dashboard correto do usuário (`GERENTE` → `/Dashboard`, outros → `/DashboardFuncionario`)
- `ADMIN` sempre passa

### 3. Verificando permission em componentes

```javascript
const { hasPermission } = useAuthStore();

{hasPermission("pedido:criar") && (
  <Button onClick={openCreate}>Novo pedido</Button>
)}

{hasPermission("usuario:deletar") && (
  <button onClick={() => handleDelete(item)}>Excluir</button>
)}
```

### 4. Buscando roles disponíveis (formulário de funcionário)

```javascript
// funcionario.service.js
export const roleService = {
  getAll: async () => {
    const { data } = await api.get("/roles");
    return data; // [{ id, name, description }]
  },
};
```

Usado no `FuncionarioForm` para popular o select de "Nível de acesso" tanto na criação quanto na edição.

---

## Fluxo completo

```
Login
  → backend monta roles[] e permissions[] a partir do banco
  → JWT carrega roles no payload (verificado a cada request)
  → frontend salva user completo no localStorage + Zustand
  → useLogin redireciona por role
  → ProtectedRoute bloqueia rotas por role
  → hasPermission() controla visibilidade de botões/menus
  → authenticate middleware valida JWT em toda rota protegida
  → requirePermission() consulta role_permissions no banco
```

---

## Adicionando um novo recurso protegido

1. Criar o `resource` no banco (seed ou migration)
2. Criar as `permissions` desejadas sobre ele
3. Atribuir via `rolePermission` aos roles que devem ter acesso
4. Adicionar `authenticate` + `requirePermission("recurso", "acao")` na rota
5. Usar `hasPermission("recurso:acao")` no frontend para esconder elementos

Nenhuma alteração de middleware ou store é necessária.
