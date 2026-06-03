# Diagrama do Banco de Dados — Hamburgueria

## Como visualizar

### Opção 1 — mermaid.live (mais fácil, sem instalar nada)
1. Acesse **https://mermaid.live**
2. Apague o conteúdo do painel esquerdo
3. Cole o código Mermaid abaixo (só o bloco de código, sem os três backticks)
4. O diagrama aparece ao vivo no painel direito
5. Botão **Download SVG** ou **PNG** para salvar

### Opção 2 — draw.io com arquivo importado
1. Acesse **https://mermaid.live**, cole o código e clique em **Export → PNG/SVG**
2. No draw.io: **File → Import → From This Device** e selecione o SVG exportado

### Opção 3 — VS Code
Instale a extensão **Markdown Preview Mermaid Support** (`bierner.markdown-mermaid`) e pressione `Ctrl+Shift+V` neste arquivo.

---

```mermaid
erDiagram

  %% ── AUTENTICAÇÃO ────────────────────────────────────────────
  User {
    Int     id          PK
    String  name
    String  cpf         UK
    String  email       UK
    String  telefone
    String  password
    Boolean active
    String  refreshToken
  }

  Role {
    Int     id          PK
    String  name        UK
    String  description
    Boolean active
  }

  Resource {
    Int    id   PK
    String name UK
  }

  Permission {
    Int    id         PK
    String action
    Int    resourceId FK
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
    Int     id       PK
    String  nome
    String  cnpj     UK
    String  email    UK
    String  telefone
    String  endereco
    Boolean active
  }

  Funcionario {
    Int      id            PK
    Int      userId        FK
    Int      restauranteId FK
    String   cargo
    Float    salario
    DateTime dataAdmissao
    Boolean  active
  }

  %% ── CARDÁPIO ─────────────────────────────────────────────────
  Produto {
    Int     id                   PK
    Int     restauranteId        FK
    String  nome
    String  descricao
    String  categoria
    Float   precoVenda
    Float   precoProducao
    Float   desconto
    Int     tempoPreparoEstimado
    Boolean ativo
    Boolean disponivel
    String  imagem
  }

  Ingrediente {
    Int     id            PK
    Int     restauranteId FK
    String  nome
    Float   quantidadeAtual
    String  unidade
    Boolean essencial
    Float   estoqueMinimo
    String  imagem
  }

  ProdutoIngrediente {
    Int   produtoId     FK
    Int   ingredienteId FK
    Float quantidadeUsada
  }

  Combo {
    Int     id            PK
    Int     restauranteId FK
    String  nome
    Float   preco
    Boolean ativo
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
    String   nomeCliente
    String   status
    String   formaPagamento
    Float    valorTotal
    DateTime tempoInicioPreparo
    DateTime tempoFimPreparo
    DateTime createdAt
  }

  PedidoItem {
    Int    id            PK
    Int    pedidoId      FK
    Int    produtoId     FK
    Int    comboId       FK
    Int    quantidade
    Float  precoUnitario
    String observacao
  }

  %% ── FINANCEIRO ───────────────────────────────────────────────
  GastoIngrediente {
    Int      id            PK
    Int      restauranteId FK
    Float    valor
    String   descricao
    Int      mes
    Int      ano
    DateTime createdAt
  }

  GastoMensal {
    Int      id            PK
    Int      restauranteId FK
    Int      mes
    Float    totalSalarios
    Int      ano
    DateTime createdAt
  }

  %% ── RELAÇÕES ─────────────────────────────────────────────────

  %% Auth
  User         ||--o{ UserRole        : "tem roles"
  Role         ||--o{ UserRole        : "atribuída a"
  Role         ||--o{ RolePermission  : "tem permissões"
  Permission   ||--o{ RolePermission  : "atribuída a"
  Resource     ||--o{ Permission      : "define"

  %% Restaurante (tenant raiz)
  Restaurante  ||--o{ Funcionario      : "emprega"
  Restaurante  ||--o{ Produto          : "oferece"
  Restaurante  ||--o{ Ingrediente      : "estoca"
  Restaurante  ||--o{ Combo            : "tem"
  Restaurante  ||--o{ Pedido           : "recebe"
  Restaurante  ||--o{ GastoIngrediente : "registra"
  Restaurante  ||--o{ GastoMensal      : "consolida"

  %% Funcionário
  User         ||--|| Funcionario      : "é"
  Funcionario  ||--o{ Pedido           : "atende"

  %% Cardápio
  Produto      ||--o{ ProdutoIngrediente : "usa"
  Ingrediente  ||--o{ ProdutoIngrediente : "compõe"
  Combo        ||--o{ ComboProduto       : "contém"
  Produto      ||--o{ ComboProduto       : "integra"

  %% Pedidos
  Pedido       ||--o{ PedidoItem : "contém"
  Produto      ||--o{ PedidoItem : "vendido em"
  Combo        ||--o{ PedidoItem : "vendido em"
```
