# Sistema de Permissões (RBAC)

## Visão Geral

O sistema usa **Role-Based Access Control (RBAC)** dinâmico — perfis e permissões são gerenciados pelo banco de dados, sem hardcode no código.

```
User → UserRole → Role → RolePermission → Permission → Resource
```

Exemplo: `João → GERENTE → dashboard:acessar, funcionario:criar`

---

## Estrutura do Banco

| Tabela | Descrição |
|---|---|
| `users` | Usuários do sistema |
| `roles` | Perfis (ADMIN, GERENTE, ATENDENTE, etc.) |
| `permissions` | Ações possíveis (criar, listar, editar, deletar) |
| `resources` | Recursos do sistema (dashboard, funcionario, pedido, etc.) |
| `user_roles` | Relaciona usuário ↔ perfil |
| `role_permissions` | Relaciona perfil ↔ permissão |

### Formato da permissão
```
{resource.name}:{permission.action}
ex: "funcionario:criar", "dashboard:acessar", "pedido:deletar"
```

---

## Backend

### 1. Criando um novo Resource + Permission no seed

```typescript
// prisma/seed.ts
const rDashboard = await prisma.resource.create({ 
  data: { name: "dashboard" } 
});

await prisma.permission.create({ 
  data: { action: "acessar", resourceId: rDashboard.id } 
});
```

### 2. Atribuindo permissão a um Role

```typescript
const perm = await prisma.permission.findFirst({
  where: { action: "acessar", resource: { name: "dashboard" } }
});

await prisma.rolePermission.create({
  data: {
    roleId: roleGerente.id,
    permissionId: perm.id,
    assignedBy: "seed"
  }
});
```

### 3. Protegendo uma rota com `requirePermission`

```typescript
// funcionario.routes.ts
import { requirePermission } from "../middleware/permission.middleware";

router.get("/",    requirePermission("funcionario", "listar"), FuncionarioController.getAll);
router.post("/",   requirePermission("funcionario", "criar"),  FuncionarioController.create);
router.put("/:id", requirePermission("funcionario", "editar"), FuncionarioController.update);
router.delete("/:id", requirePermission("funcionario", "deletar"), FuncionarioController.hardDelete);
```

### 4. Bypass do ADMIN

O ADMIN bypassa **automaticamente** todas as verificações de permissão no middleware:

```typescript
// permission.middleware.ts
if (userRoles.includes("ADMIN")) {
  next(); // pula a verificação
  return;
}
```

Não é necessário nenhuma configuração extra para o ADMIN.

### 5. Adicionando novos recursos

1. Crie o resource no banco
2. Crie as permissions desejadas
3. Atribua ao role via `rolePermission`
4. Use `requirePermission("recurso", "acao")` na rota

---

## Frontend

### 1. O que vem no login

Após o login, o objeto `user` contém:

```json
{
  "id": 1,
  "name": "João Gerente",
  "email": "gerente@teste.com",
  "roles": ["GERENTE"],
  "permissions": ["dashboard:acessar", "funcionario:criar", "funcionario:listar"]
}
```

### 2. Verificando permissão em componentes

```javascript
import useAuthStore from "../store/useAuthStore";

const { hasPermission } = useAuthStore();

// Esconder botão sem permissão
{hasPermission("funcionario:criar") && (
  <Button onClick={openCreate}>Novo funcionário</Button>
)}

// Esconder coluna de ações
{hasPermission("funcionario:deletar") && (
  <button onClick={() => handleDelete(item)}>Excluir</button>
)}
```

### 3. Protegendo rotas com `ProtectedRoute`

```jsx
// AppRoutes.jsx
<Route
  path="/Dashboard"
  element={
    <ProtectedRoute requiredPermission="dashboard:acessar">
      <DashboardLayout />
    </ProtectedRoute>
  }
>
```

### 4. Redirecionamento automático no login

O usuário é redirecionado com base nas permissões:

```javascript
// useLogin.js
const destination = user.permissions.includes("dashboard:acessar")
  ? "/Dashboard"
  : "/DashboardFuncionario";
```

### 5. Adicionando proteção a uma nova página

1. Crie o resource e permission no banco (ex: `relatorio:acessar`)
2. Atribua ao role desejado
3. Proteja a rota:

```jsx
<Route
  path="/relatorios"
  element={
    <ProtectedRoute requiredPermission="relatorio:acessar">
      <Relatorios />
    </ProtectedRoute>
  }
/>
```

4. Esconda elementos na UI:
```jsx
{hasPermission("relatorio:acessar") && <NavItem to="/relatorios" label="Relatórios" />}
```

---

## Fluxo Completo

```
Login
  → backend retorna permissions[] no payload
  → frontend salva no localStorage + Zustand store
  → ProtectedRoute verifica permission antes de renderizar
  → hasPermission() controla visibilidade de botões/menus
  → requirePermission() bloqueia chamadas não autorizadas na API
```

---

## Adicionando um Novo Perfil (via ADMIN)

1. Criar o role no banco
2. Atribuir as permissions desejadas via `rolePermission`
3. Atribuir o role ao usuário via `userRole`
4. No próximo login (ou chamada ao `/auth/me`), o frontend já reflete as novas permissões

Nenhuma alteração de código é necessária.
