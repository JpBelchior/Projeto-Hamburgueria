# Diagrama do Banco de Dados — Hamburgueria

## Como visualizar

### Opção 1 — mermaid.live (sem instalar nada)
1. Acesse **https://mermaid.live**
2. Apague o conteúdo do painel esquerdo
3. Cole o bloco Mermaid abaixo (sem os três backticks)
4. O diagrama aparece ao vivo no painel direito

### Opção 2 — VS Code
Instale a extensão **Markdown Preview Mermaid Support** (`bierner.markdown-mermaid`) e pressione `Ctrl+Shift+V` neste arquivo.

---

```mermaid
erDiagram

  %% ── AUTENTICAÇÃO ────────────────────────────────────────────
  User {
    Int      id           PK
    String   name
    String   cpf          UK
    String   email        UK
    String   telefone     "optional"
    String   password
    Boolean  active
    String   refreshToken "optional"
    DateTime createdAt
    DateTime updatedAt
  }

  Role {
    Int      id          PK
    String   name        UK
    String   description "optional"
    Boolean  active
    DateTime createdAt
    DateTime updatedAt
  }

  Resource {
    Int    id   PK
    String name UK
  }

  Permission {
    Int      id          PK
    String   action
    String   description "optional"
    Int      resourceId  FK
    DateTime createdAt
    DateTime updatedAt
  }

  UserRole {
    Int      userId     FK
    Int      roleId     FK
    DateTime assignedAt
    String   assignedBy
  }

  RolePermission {
    Int      roleId       FK
    Int      permissionId FK
    DateTime assignedAt
    String   assignedBy
  }

  %% ── RESTAURANTE / TENANT ─────────────────────────────────────
  Restaurante {
    Int      id        PK
    String   nome
    String   cnpj      UK
    String   email     UK
    String   telefone  "optional"
    String   endereco  "optional"
    Boolean  active
    DateTime createdAt
    DateTime updatedAt
  }

  Funcionario {
    Int      id            PK
    Int      userId        FK
    Int      restauranteId FK
    String   cargo
    Float    salario
    DateTime dataAdmissao
    Boolean  active
    DateTime createdAt
    DateTime updatedAt
  }

  %% ── CARDÁPIO ─────────────────────────────────────────────────
  Produto {
    Int      id                   PK
    Int      restauranteId        FK
    String   nome
    String   descricao            "optional"
    String   categoria
    Float    precoVenda
    Float    precoProducao        "optional"
    Float    desconto
    Int      tempoPreparoEstimado "optional"
    Boolean  ativo
    Boolean  disponivel
    String   imagem               "optional"
    DateTime createdAt
    DateTime updatedAt
  }

  Ingrediente {
    Int      id              PK
    Int      restauranteId   FK
    String   nome
    Float    quantidadeAtual
    String   unidade
    Boolean  essencial
    Float    estoqueMinimo   "optional"
    String   imagem          "optional"
    DateTime createdAt
    DateTime updatedAt
  }

  ProdutoIngrediente {
    Int   produtoId       FK
    Int   ingredienteId   FK
    Float quantidadeUsada
  }

  Combo {
    Int      id            PK
    Int      restauranteId FK
    String   nome
    Float    preco
    Boolean  ativo
    DateTime createdAt
    DateTime updatedAt
  }

  ComboProduto {
    Int comboId    FK
    Int produtoId  FK
    Int quantidade
  }

  %% ── PEDIDOS ──────────────────────────────────────────────────
  Pedido {
    Int      id                 PK
    Int      restauranteId      FK
    Int      funcionarioId      FK
    String   numeroPedido
    String   nomeCliente        "optional"
    String   status
    String   formaPagamento     "optional"
    Float    valorTotal
    DateTime tempoInicioPreparo "optional"
    DateTime tempoFimPreparo    "optional"
    DateTime createdAt
    DateTime updatedAt
  }

  PedidoItem {
    Int    id            PK
    Int    pedidoId      FK
    Int    produtoId     FK "optional"
    Int    comboId       FK "optional"
    Int    quantidade
    Float  precoUnitario
    String observacao    "optional"
  }

  %% ── FINANCEIRO ───────────────────────────────────────────────
  GastoIngrediente {
    Int      id            PK
    Int      restauranteId FK
    String   nome
    Float    valor
    String   descricao     "optional"
    Int      mes
    Int      ano
    DateTime createdAt
    DateTime updatedAt
  }

  GastoIngredienteIngrediente {
    Int gastoIngredienteId FK
    Int ingredienteId      FK
  }

  GastoFuncionario {
    Int      id            PK
    Int      restauranteId FK
    String   nome
    Float    valor
    String   descricao     "optional"
    Int      mes
    Int      ano
    DateTime createdAt
    DateTime updatedAt
  }

  GastoFuncionarioFuncionario {
    Int gastoFuncionarioId FK
    Int funcionarioId      FK
  }

  %% ── RELAÇÕES ─────────────────────────────────────────────────

  %% Auth
  User         ||--o{ UserRole                    : "tem roles"
  Role         ||--o{ UserRole                    : "atribuída a"
  Role         ||--o{ RolePermission              : "tem permissões"
  Permission   ||--o{ RolePermission              : "atribuída a"
  Resource     ||--o{ Permission                  : "define"

  %% Restaurante (tenant raiz)
  Restaurante  ||--o{ Funcionario                 : "emprega"
  Restaurante  ||--o{ Produto                     : "oferece"
  Restaurante  ||--o{ Ingrediente                 : "estoca"
  Restaurante  ||--o{ Combo                       : "tem"
  Restaurante  ||--o{ Pedido                      : "recebe"
  Restaurante  ||--o{ GastoIngrediente            : "registra"
  Restaurante  ||--o{ GastoFuncionario            : "registra"

  %% Funcionário
  User         ||--|| Funcionario                 : "é"
  Funcionario  ||--o{ Pedido                      : "atende"
  Funcionario  ||--o{ GastoFuncionarioFuncionario : "tem pagamentos"

  %% Cardápio
  Produto      ||--o{ ProdutoIngrediente          : "usa"
  Ingrediente  ||--o{ ProdutoIngrediente          : "compõe"
  Combo        ||--o{ ComboProduto                : "contém"
  Produto      ||--o{ ComboProduto                : "integra"
  Ingrediente  ||--o{ GastoIngredienteIngrediente : "em compras"

  %% Pedidos
  Pedido       ||--o{ PedidoItem                  : "contém"
  Produto      ||--o{ PedidoItem                  : "vendido em"
  Combo        ||--o{ PedidoItem                  : "vendido em"

  %% Financeiro
  GastoIngrediente ||--o{ GastoIngredienteIngrediente : "registra"
  GastoFuncionario ||--o{ GastoFuncionarioFuncionario : "registra"
```
