# Bugs e Melhorias — Revisão de Código

Levantados em 25/06/2026 via revisão automatizada do diff atual.
Ordenados por prioridade: corrija de cima para baixo.


Auditoria de Segurança Multi-Tenant — Hamburgueria
Context
Análise de isolamento de dados entre restaurantes. O sistema usa JWT com restauranteId embutido, extraído via RequestContext (AsyncLocalStorage) e aplicado como filtro em todas as queries. O objetivo é listar falhas onde um usuário de um restaurante poderia acessar ou manipular dados de outro.

Infraestrutura de Autenticação (OK)
A base está correta e sólida:

auth.middleware.ts — valida Bearer JWT, injeta req.user
context.middleware.ts — injeta restauranteId do token em AsyncLocalStorage
tenant.middleware.ts — rejeita com 403 se usuário não tiver restauranteId
Os três middlewares são aplicados em bloco a todas as rotas de negócio em routes/index.ts
Rotas públicas corretas: POST /auth/login, POST /auth/refresh, POST /restaurantes/onboarding, GET /roles
Problemas Encontrados
🔴 CRÍTICO — IDs de relacionamentos em Gasto não são validados contra o restaurante
Arquivo: src/services/gasto.service.ts

O pedido.service.ts tem a função validarItensRestaurante() (linhas 7–27) que verifica se cada produtoId/comboId/promocaoId passado no DTO pertence ao restaurante atual. O gasto.service.ts não tem equivalente, então um usuário pode passar IDs de outro restaurante no corpo da requisição:

Função	Linha	Problema
create() — tipo INGREDIENTE	103–109	tx.ingrediente.update({ where: { id } }) — o id vem do DTO sem validação; um usuário pode incrementar o estoque de um ingrediente de outro restaurante
create() — tipo FUNCIONARIO	125–128	{ create: funcionarioIds.map(id => ({ funcionarioId: id })) } — associa gastos a funcionários de outros restaurantes
update() — tipo INGREDIENTE	155–183	Ao reverter e reaplicar quantidades, usa ingredienteId das entradas antigas/novas sem checar restauranteId
remove() com reverterEstoque	215–222	tx.ingrediente.update({ where: { id: j.ingredienteId } }) sem restauranteId
Impacto real: Um usuário autenticado pode enviar ingredientes: [{ id: 999, quantidade: 100 }] apontando para ingrediente de outro restaurante e manipular o estoque dele.

🟡 MÉDIO — UPDATE/DELETE sem restauranteId no WHERE (defense-in-depth)
O padrão usado é: primeiro findFirst({ where: { id, restauranteId } }), e se existir, executa o UPDATE/DELETE com apenas { id }. Tecnicamente não é explorável porque o restauranteId vem do JWT verificado — mas é uma violação de defesa em profundidade: um bug em qualquer camada (contexto errado, AsyncLocalStorage vazar entre requests, falha de middleware) abriria a operação para qualquer ID.

Arquivo	Função	Linha	Operação vulnerável
ingrediente.service.ts	atualizarIngrediente()	93	prisma.ingrediente.update({ where: { id } })
ingrediente.service.ts	toggleAtivo()	104	prisma.ingrediente.update({ where: { id } })
ingrediente.service.ts	deletarIngrediente()	115	prisma.ingrediente.delete({ where: { id } })
gasto.service.ts	update() — path transacional	186	tx.gasto.update({ where: { id } })
gasto.service.ts	update() — path direto	200	prisma.gasto.update({ where: { id } })
gasto.service.ts	remove() — path transacional	225	tx.gasto.delete({ where: { id } })
gasto.service.ts	remove() — path direto	230	prisma.gasto.delete({ where: { id } })
promocao.service.ts	atualizarPromocao()	112	tx.promocao.update({ where: { id: promocaoId } })
promocao.service.ts	toggleAtivo()	141	prisma.promocao.update({ where: { id } })
promocao.service.ts	deletarPromocao()	154	prisma.promocao.delete({ where: { id } })
produto.service.ts	toggleAtivo()	291	prisma.produto.update({ where: { id } })
produto.service.ts	deletarProduto()	342	tx.produto.delete({ where: { id } })
A correção é simples: trocar where: { id } por where: { id, restauranteId } em todos esses casos (o campo restauranteId já está disponível no escopo de cada função).

🟡 MÉDIO — RBAC implementado mas desativado
Arquivo: src/middleware/permission.middleware.ts (existe mas não é usado em nenhuma rota)

Qualquer funcionário com vínculo a um restaurante consegue criar, editar e deletar qualquer entidade — não há distinção de papéis além de "está logado e tem restaurante". O sistema tem roles (GERENTE, CAIXA, etc.) mas elas não protegem rotas individualmente.

🟢 OK — Listagens não expõem dados de outros restaurantes
Todas as queries de listagem filtram por restauranteId:

findMany e findFirst sempre incluem restauranteId no where
Queries SQL raw ($queryRaw) incluem WHERE restauranteId = ${restauranteId} com parametrização (safe contra SQL injection)
Os select explícitos (ex: ingredienteSelect, promocaoSelect, produtoSelect) não incluem restauranteId na resposta — bom
Exceção: respostas de gasto usam include: includeGasto sem select explícito no nível raiz, então o campo restauranteId é retornado no objeto gasto. Não é cross-tenant, mas é informação desnecessária exposta
🟢 OK — Entidades bem protegidas
Entidade	Leitura	Escrita	Observação
Pedido	✅	✅	Tem validarItensRestaurante() nos itens
Produto	✅	✅ (exceto toggleAtivo/delete WHERE)	
Combo	✅	✅	
Funcionário	✅	✅	Tem validação de hierarquia de roles
Ingrediente	✅	✅ (exceto WHERE em mutações)	
Promoção	✅	✅ (exceto WHERE em mutações)	
Gasto	✅	⚠️ IDs do DTO não validados	
Financeiro	✅	N/A	
Restaurante	✅	✅	Usa RequestContext corretamente
Resumo Priorizado
🔴 Crítico — Adicionar validação de ownership dos IDs passados no DTO de Gasto (ingredientes e funcionários), no padrão de validarItensRestaurante() do pedido
🟡 Médio — Adicionar restauranteId nos WHERE de UPDATE/DELETE (12 ocorrências, trivial)
🟡 Médio — Definir e aplicar requirePermission nas rotas que exigem papel mínimo (ex: só GERENTE deleta funcionários)
🟢 Baixo — Adicionar select explícito no retorno dos gastos para não expor restauranteId