import {
  PrismaClient,
  Cargo,
  CategoriaProduct,
  UnidadeMedida,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─────────────────────────────────────────
  // LIMPEZA COMPLETA — respeita ordem das FKs
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // RESTAURANTE DEMO
  // ─────────────────────────────────────────
  const restaurante = await prisma.restaurante.create({
    data: {
      nome: "Hamburgueria Demo",
      cnpj: "00.000.000/0001-00",
      email: "contato@hamburgueriademo.com",
      telefone: "(11) 99999-9999",
    },
  });

  console.log("✅ Restaurante criado.");

  // ─────────────────────────────────────────
  // RESOURCES
  // ─────────────────────────────────────────
  const [rPedido, rProduto, rUsuario, rCombo] = await Promise.all([
    prisma.resource.create({ data: { name: "pedido" } }),
    prisma.resource.create({ data: { name: "produto" } }),
    prisma.resource.create({ data: { name: "usuario" } }),
    prisma.resource.create({ data: { name: "combo" } }),
  ]);

  console.log("✅ Resources criados.");

  // ─────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────
  const actions = ["criar", "listar", "editar", "deletar"];
  const resources = [rPedido, rProduto, rUsuario, rCombo];

  await Promise.all(
    resources.flatMap((resource) =>
      actions.map((action) =>
        prisma.permission.create({
          data: { action, resourceId: resource.id },
        })
      )
    )
  );

  console.log("✅ Permissions criadas.");

  // ─────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────
  const roleAdmin = await prisma.role.create({
    data: { name: "ADMIN", description: "Administrador global do SaaS — acesso irrestrito" },
  });

  const roleAdminRestaurante = await prisma.role.create({
    data: { name: "ADMIN_RESTAURANTE", description: "Proprietário do restaurante — acesso irrestrito ao próprio restaurante" },
  });

  const roleGerente = await prisma.role.create({
    data: { name: "GERENTE", description: "Gerência operacional do restaurante" },
  });

  const roleAtendente = await prisma.role.create({
    data: { name: "ATENDENTE", description: "Acesso operacional — registra pedidos" },
  });

  console.log("✅ Roles criadas.");

  // ─────────────────────────────────────────
  // USUÁRIOS
  // ─────────────────────────────────────────
  const senhaHash = await bcrypt.hash("123456", 10);

  // ADMIN global — sem restaurante
  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@teste.com",
      cpf: "999.999.999-99",
      password: senhaHash,
      roles: {
        create: { roleId: roleAdmin.id, assignedBy: "seed" },
      },
    },
  });

  // Dono do restaurante demo
  const dono = await prisma.user.create({
    data: {
      name: "João Proprietário",
      email: "dono@hamburgueriademo.com",
      cpf: "000.000.000-00",
      password: senhaHash,
      funcionario: {
        create: { cargo: Cargo.CAIXA, salario: 6000, restauranteId: restaurante.id },
      },
      roles: {
        create: { roleId: roleAdminRestaurante.id, assignedBy: "seed" },
      },
    },
  });

  // Gerente do restaurante demo
  const gerente = await prisma.user.create({
    data: {
      name: "Maria Gerente",
      email: "gerente@hamburgueriademo.com",
      cpf: "111.111.111-11",
      password: senhaHash,
      funcionario: {
        create: { cargo: Cargo.CAIXA, salario: 4500, restauranteId: restaurante.id },
      },
      roles: {
        create: { roleId: roleGerente.id, assignedBy: "seed" },
      },
    },
  });

  // Atendente do restaurante demo
  const atendente = await prisma.user.create({
    data: {
      name: "Carlos Atendente",
      email: "atendente@hamburgueriademo.com",
      cpf: "222.222.222-22",
      password: senhaHash,
      funcionario: {
        create: { cargo: Cargo.ATENDENTE, salario: 2000, restauranteId: restaurante.id },
      },
      roles: {
        create: { roleId: roleAtendente.id, assignedBy: "seed" },
      },
    },
  });

  console.log("✅ Usuários criados:");
  console.log(`   Admin      → ${admin.email}                    / senha: 123456`);
  console.log(`   Dono       → ${dono.email}   / senha: 123456`);
  console.log(`   Gerente    → ${gerente.email} / senha: 123456`);
  console.log(`   Atendente  → ${atendente.email} / senha: 123456`);

  // ─────────────────────────────────────────
  // INGREDIENTES (vinculados ao restaurante)
  // ─────────────────────────────────────────
  const rid = restaurante.id;

  const [
    paoBrioche,
    carneBovina,
    queijoCheddar,
    alface,
    tomate,
    bacon,
    molhoEspecial,
    batataPalito,
  ] = await Promise.all([
    prisma.ingrediente.create({ data: { nome: "Pão Brioche", quantidadeAtual: 100, unidade: UnidadeMedida.UNIDADE, custoPorUnidade: 1.5, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Carne Bovina 150g", quantidadeAtual: 50, unidade: UnidadeMedida.UNIDADE, custoPorUnidade: 8.0, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Queijo Cheddar", quantidadeAtual: 200, unidade: UnidadeMedida.G, custoPorUnidade: 0.08, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Alface", quantidadeAtual: 30, unidade: UnidadeMedida.UNIDADE, custoPorUnidade: 0.3, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Tomate", quantidadeAtual: 40, unidade: UnidadeMedida.UNIDADE, custoPorUnidade: 0.5, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Bacon", quantidadeAtual: 100, unidade: UnidadeMedida.G, custoPorUnidade: 0.12, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Molho Especial", quantidadeAtual: 2, unidade: UnidadeMedida.LITRO, custoPorUnidade: 3.0, restauranteId: rid } }),
    prisma.ingrediente.create({ data: { nome: "Batata Palito", quantidadeAtual: 10, unidade: UnidadeMedida.KG, custoPorUnidade: 4.0, restauranteId: rid } }),
  ]);

  console.log("✅ Ingredientes criados.");

  // ─────────────────────────────────────────
  // PRODUTOS (vinculados ao restaurante)
  // ─────────────────────────────────────────
  const classicBurger = await prisma.produto.create({
    data: {
      nome: "Classic Burger",
      descricao: "Pão brioche, carne 150g, alface, tomate e molho especial",
      categoria: CategoriaProduct.PRINCIPAL,
      precoVenda: 28.9,
      tempoPreparoEstimado: 12,
      restauranteId: rid,
      ingredientes: {
        create: [
          { ingredienteId: paoBrioche.id, quantidadeUsada: 1 },
          { ingredienteId: carneBovina.id, quantidadeUsada: 1 },
          { ingredienteId: alface.id, quantidadeUsada: 1 },
          { ingredienteId: tomate.id, quantidadeUsada: 1 },
          { ingredienteId: molhoEspecial.id, quantidadeUsada: 0.03 },
        ],
      },
    },
  });

  const cheeseBacon = await prisma.produto.create({
    data: {
      nome: "Cheese Bacon",
      descricao: "Pão brioche, carne 150g, queijo cheddar, bacon e molho",
      categoria: CategoriaProduct.PRINCIPAL,
      precoVenda: 35.9,
      tempoPreparoEstimado: 15,
      restauranteId: rid,
      ingredientes: {
        create: [
          { ingredienteId: paoBrioche.id, quantidadeUsada: 1 },
          { ingredienteId: carneBovina.id, quantidadeUsada: 1 },
          { ingredienteId: queijoCheddar.id, quantidadeUsada: 30 },
          { ingredienteId: bacon.id, quantidadeUsada: 50 },
          { ingredienteId: molhoEspecial.id, quantidadeUsada: 0.03 },
        ],
      },
    },
  });

  const batataPorcao = await prisma.produto.create({
    data: {
      nome: "Porção de Batata Frita",
      descricao: "Porção crocante de batata palito (200g)",
      categoria: CategoriaProduct.ACOMPANHAMENTO,
      precoVenda: 14.9,
      tempoPreparoEstimado: 8,
      restauranteId: rid,
      ingredientes: {
        create: [{ ingredienteId: batataPalito.id, quantidadeUsada: 0.2 }],
      },
    },
  });

  const cocaCola = await prisma.produto.create({
    data: {
      nome: "Coca-Cola Lata",
      descricao: "350ml gelada",
      categoria: CategoriaProduct.BEBIDA,
      precoVenda: 6.0,
      restauranteId: rid,
    },
  });

  const sucoLaranja = await prisma.produto.create({
    data: {
      nome: "Suco de Laranja",
      descricao: "300ml natural",
      categoria: CategoriaProduct.BEBIDA,
      precoVenda: 8.0,
      tempoPreparoEstimado: 3,
      restauranteId: rid,
    },
  });

  console.log("✅ Produtos criados.");

  // ─────────────────────────────────────────
  // COMBOS (vinculados ao restaurante)
  // ─────────────────────────────────────────
  await prisma.combo.create({
    data: {
      nome: "Combo Classic",
      preco: 39.9,
      restauranteId: rid,
      produtos: {
        create: [
          { produtoId: classicBurger.id, quantidade: 1 },
          { produtoId: batataPorcao.id, quantidade: 1 },
          { produtoId: cocaCola.id, quantidade: 1 },
        ],
      },
    },
  });

  await prisma.combo.create({
    data: {
      nome: "Combo Cheese Bacon",
      preco: 49.9,
      restauranteId: rid,
      produtos: {
        create: [
          { produtoId: cheeseBacon.id, quantidade: 1 },
          { produtoId: batataPorcao.id, quantidade: 1 },
          { produtoId: sucoLaranja.id, quantidade: 1 },
        ],
      },
    },
  });

  console.log("✅ Combos criados.");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
