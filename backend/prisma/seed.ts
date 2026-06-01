import {
  PrismaClient,
  Cargo,
  CategoriaProduct,
  StatusPedido,
  FormaPagamento,
  UnidadeMedida,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function dataAtras(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  // horário entre 11h e 22h
  d.setHours(11 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Limpeza ───────────────────────────────────────────────────────────────
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.comboProduto.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.produtoIngrediente.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.funcionario.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurante.deleteMany();
  console.log("🧹 Banco limpo.");

  // ── Restaurante ───────────────────────────────────────────────────────────
  const restaurante = await prisma.restaurante.create({
    data: {
      nome: "Hamburgueria Demo",
      cnpj: "00.000.000/0001-00",
      email: "contato@hamburgueriademo.com",
      telefone: "(11) 99999-9999",
    },
  });
  const rid = restaurante.id;
  console.log("✅ Restaurante criado.");

  // ── Resources + Permissions ───────────────────────────────────────────────
  const [rPedido, rProduto, rUsuario, rCombo] = await Promise.all([
    prisma.resource.create({ data: { name: "pedido" } }),
    prisma.resource.create({ data: { name: "produto" } }),
    prisma.resource.create({ data: { name: "usuario" } }),
    prisma.resource.create({ data: { name: "combo" } }),
  ]);

  await Promise.all(
    [rPedido, rProduto, rUsuario, rCombo].flatMap((r) =>
      ["criar", "listar", "editar", "deletar"].map((a) =>
        prisma.permission.create({ data: { action: a, resourceId: r.id } })
      )
    )
  );

  // ── Roles ─────────────────────────────────────────────────────────────────
  const [roleAdmin, roleAdminRest, roleGerente, roleAtendente] = await Promise.all([
    prisma.role.create({ data: { name: "ADMIN",              description: "Administrador global do SaaS" } }),
    prisma.role.create({ data: { name: "ADMIN_RESTAURANTE",  description: "Proprietário do restaurante" } }),
    prisma.role.create({ data: { name: "GERENTE",            description: "Gerência operacional" } }),
    prisma.role.create({ data: { name: "ATENDENTE",          description: "Acesso operacional" } }),
  ]);
  console.log("✅ Roles e permissões criadas.");

  // ── Usuários + Funcionários ───────────────────────────────────────────────
  const hash = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      name: "Administrador", email: "admin@teste.com", cpf: "999.999.999-99", password: hash,
      roles: { create: { roleId: roleAdmin.id, assignedBy: "seed" } },
    },
  });

  await prisma.user.create({
    data: {
      name: "João Proprietário", email: "dono@hamburgueriademo.com", cpf: "000.000.000-00", password: hash,
      funcionario: { create: { cargo: Cargo.CAIXA, salario: 6000, restauranteId: rid } },
      roles: { create: { roleId: roleAdminRest.id, assignedBy: "seed" } },
    },
  });

  await prisma.user.create({
    data: {
      name: "Maria Gerente", email: "gerente@hamburgueriademo.com", cpf: "111.111.111-11", password: hash,
      funcionario: { create: { cargo: Cargo.CAIXA, salario: 4500, restauranteId: rid } },
      roles: { create: { roleId: roleGerente.id, assignedBy: "seed" } },
    },
  });

  const u1 = await prisma.user.create({
    data: {
      name: "Carlos Atendente", email: "atendente@hamburgueriademo.com", cpf: "222.222.222-22", password: hash,
      funcionario: { create: { cargo: Cargo.ATENDENTE, salario: 2000, restauranteId: rid } },
      roles: { create: { roleId: roleAtendente.id, assignedBy: "seed" } },
    },
    include: { funcionario: true },
  });

  const u2 = await prisma.user.create({
    data: {
      name: "Fernanda Atendente", email: "atendente2@hamburgueriademo.com", cpf: "333.333.333-33", password: hash,
      funcionario: { create: { cargo: Cargo.ATENDENTE, salario: 2000, restauranteId: rid } },
      roles: { create: { roleId: roleAtendente.id, assignedBy: "seed" } },
    },
    include: { funcionario: true },
  });

  await prisma.user.create({
    data: {
      name: "Rafael Cozinheiro", email: "cozinheiro@hamburgueriademo.com", cpf: "444.444.444-44", password: hash,
      funcionario: { create: { cargo: Cargo.COZINHEIRO, salario: 2500, restauranteId: rid } },
    },
  });

  const funcIds = [u1.funcionario!.id, u2.funcionario!.id];
  console.log("✅ Usuários criados.");

  // ── Ingredientes ──────────────────────────────────────────────────────────
  const [paoBrioche, carneBovina, queijoCheddar, alface, tomate, bacon, molhoEspecial, batataPalito] =
    await Promise.all([
      prisma.ingrediente.create({ data: { nome: "Pão Brioche",       quantidadeAtual: 200, estoqueMinimo: 50,  unidade: UnidadeMedida.UNIDADE, restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Carne Bovina 150g", quantidadeAtual: 80,  estoqueMinimo: 20,  unidade: UnidadeMedida.UNIDADE, restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Queijo Cheddar",    quantidadeAtual: 500, estoqueMinimo: 100, unidade: UnidadeMedida.G,       restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Alface",            quantidadeAtual: 50,  estoqueMinimo: 10,  unidade: UnidadeMedida.UNIDADE, restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Tomate",            quantidadeAtual: 60,  estoqueMinimo: 15,  unidade: UnidadeMedida.UNIDADE, restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Bacon",             quantidadeAtual: 300, estoqueMinimo: 80,  unidade: UnidadeMedida.G,       restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Molho Especial",    quantidadeAtual: 5,   estoqueMinimo: 1,   unidade: UnidadeMedida.LITRO,   restauranteId: rid } }),
      prisma.ingrediente.create({ data: { nome: "Batata Palito",     quantidadeAtual: 15,  estoqueMinimo: 3,   unidade: UnidadeMedida.KG,      restauranteId: rid } }),
    ]);
  console.log("✅ Ingredientes criados.");

  // ── Produtos ──────────────────────────────────────────────────────────────
  const classicBurger = await prisma.produto.create({
    data: {
      nome: "Classic Burger", descricao: "Pão brioche, carne 150g, alface, tomate e molho especial",
      categoria: CategoriaProduct.PRINCIPAL, precoVenda: 28.9, tempoPreparoEstimado: 12, restauranteId: rid,
      ingredientes: { create: [
        { ingredienteId: paoBrioche.id,    quantidadeUsada: 1    },
        { ingredienteId: carneBovina.id,   quantidadeUsada: 1    },
        { ingredienteId: alface.id,        quantidadeUsada: 1    },
        { ingredienteId: tomate.id,        quantidadeUsada: 1    },
        { ingredienteId: molhoEspecial.id, quantidadeUsada: 0.03 },
      ]},
    },
  });

  const smashDuplo = await prisma.produto.create({
    data: {
      nome: "Smash Burger Duplo", descricao: "Dois smash de carne 90g, queijo duplo, molho e pão brioche",
      categoria: CategoriaProduct.PRINCIPAL, precoVenda: 39.9, tempoPreparoEstimado: 14, restauranteId: rid,
      ingredientes: { create: [
        { ingredienteId: paoBrioche.id,    quantidadeUsada: 1    },
        { ingredienteId: carneBovina.id,   quantidadeUsada: 1    },
        { ingredienteId: queijoCheddar.id, quantidadeUsada: 50   },
        { ingredienteId: molhoEspecial.id, quantidadeUsada: 0.04 },
      ]},
    },
  });

  const cheeseBacon = await prisma.produto.create({
    data: {
      nome: "Cheese Bacon", descricao: "Pão brioche, carne 150g, queijo cheddar, bacon e molho",
      categoria: CategoriaProduct.PRINCIPAL, precoVenda: 35.9, tempoPreparoEstimado: 15, restauranteId: rid,
      ingredientes: { create: [
        { ingredienteId: paoBrioche.id,    quantidadeUsada: 1    },
        { ingredienteId: carneBovina.id,   quantidadeUsada: 1    },
        { ingredienteId: queijoCheddar.id, quantidadeUsada: 30   },
        { ingredienteId: bacon.id,         quantidadeUsada: 50   },
        { ingredienteId: molhoEspecial.id, quantidadeUsada: 0.03 },
      ]},
    },
  });

  const batataPorcao = await prisma.produto.create({
    data: {
      nome: "Porção de Batata Frita", descricao: "Porção crocante de batata palito (200g)",
      categoria: CategoriaProduct.ACOMPANHAMENTO, precoVenda: 14.9, tempoPreparoEstimado: 8, restauranteId: rid,
      ingredientes: { create: [{ ingredienteId: batataPalito.id, quantidadeUsada: 0.2 }] },
    },
  });

  const cocaCola = await prisma.produto.create({
    data: {
      nome: "Coca-Cola Lata", descricao: "350ml gelada",
      categoria: CategoriaProduct.BEBIDA, precoVenda: 6.0, restauranteId: rid,
    },
  });

  const sucoLaranja = await prisma.produto.create({
    data: {
      nome: "Suco de Laranja", descricao: "300ml natural",
      categoria: CategoriaProduct.BEBIDA, precoVenda: 8.0, tempoPreparoEstimado: 3, restauranteId: rid,
    },
  });
  console.log("✅ Produtos criados.");

  // ── Combos ────────────────────────────────────────────────────────────────
  await prisma.combo.create({
    data: {
      nome: "Combo Classic", preco: 39.9, restauranteId: rid,
      produtos: { create: [
        { produtoId: classicBurger.id, quantidade: 1 },
        { produtoId: batataPorcao.id,  quantidade: 1 },
        { produtoId: cocaCola.id,      quantidade: 1 },
      ]},
    },
  });

  await prisma.combo.create({
    data: {
      nome: "Combo Cheese Bacon", preco: 49.9, restauranteId: rid,
      produtos: { create: [
        { produtoId: cheeseBacon.id,  quantidade: 1 },
        { produtoId: batataPorcao.id, quantidade: 1 },
        { produtoId: sucoLaranja.id,  quantidade: 1 },
      ]},
    },
  });
  console.log("✅ Combos criados.");

  // ── Pedidos ───────────────────────────────────────────────────────────────
  // Distribuição: mais pedidos nos últimos 7 dias, esparso nos 30 dias
  // Total: 52 pedidos
  const distribuicao: [number, number][] = [
    [0, 8], [1, 7], [2, 6], [3, 5], [4, 5], [5, 4], [6, 4],
    [8, 2], [10, 2], [12, 2], [15, 2], [18, 2], [20, 1], [22, 2], [25, 1], [28, 1],
  ];

  const principais   = [classicBurger, smashDuplo, cheeseBacon];
  const acompanhs    = [batataPorcao, cocaCola, sucoLaranja];
  const formas       = [FormaPagamento.PIX, FormaPagamento.CARTAO_CREDITO, FormaPagamento.CARTAO_DEBITO, FormaPagamento.DINHEIRO];
  const nomesCliente = ["Ana Lima", "Bruno Costa", "Carlos Dias", "Diana Souza", "Eduardo Neto", "Fernanda Reis", "Gabriel Melo", "Helena Cruz", "Igor Pinto", "Julia Rocha"];

  let num = 1;

  for (const [dias, qtd] of distribuicao) {
    for (let i = 0; i < qtd; i++) {
      const cancelado   = Math.random() < 0.05;
      const criado      = dataAtras(dias);
      const principal   = pick(principais);
      const acomp       = Math.random() > 0.35 ? pick(acompanhs) : null;
      const prepMin     = principal.tempoPreparoEstimado ?? 10;
      const inicioPre   = new Date(criado.getTime() + 2 * 60_000);
      const fimPre      = new Date(inicioPre.getTime() + (prepMin + Math.floor(Math.random() * 5)) * 60_000);
      const valor       = principal.precoVenda + (acomp?.precoVenda ?? 0);

      await prisma.pedido.create({
        data: {
          numeroPedido:       `P${String(num++).padStart(4, "0")}`,
          nomeCliente:        pick(nomesCliente),
          status:             cancelado ? StatusPedido.CANCELADO : StatusPedido.FINALIZADO,
          formaPagamento:     pick(formas),
          valorTotal:         valor,
          funcionarioId:      pick(funcIds),
          restauranteId:      rid,
          createdAt:          criado,
          tempoInicioPreparo: cancelado ? null : inicioPre,
          tempoFimPreparo:    cancelado ? null : fimPre,
          itens: {
            create: [
              { produtoId: principal.id, quantidade: 1, precoUnitario: principal.precoVenda },
              ...(acomp ? [{ produtoId: acomp.id, quantidade: 1, precoUnitario: acomp.precoVenda }] : []),
            ],
          },
        },
      });
    }
  }

  console.log(`✅ ${num - 1} pedidos criados.`);
  console.log("");
  console.log("🔑 Credenciais:");
  console.log("   gerente@hamburgueriademo.com    / 123456");
  console.log("   atendente@hamburgueriademo.com  / 123456");
  console.log("   atendente2@hamburgueriademo.com / 123456");
  console.log("   cozinheiro@hamburgueriademo.com / 123456");
  console.log("");
  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
