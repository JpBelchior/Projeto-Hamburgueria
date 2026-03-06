import {
  PrismaClient,
  Role,
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
  await prisma.user.deleteMany();

  console.log("🧹 Banco limpo.");

  // ─────────────────────────────────────────
  // USUÁRIOS
  // ─────────────────────────────────────────
  const senhaHash = await bcrypt.hash("123456", 10);

  const gerente = await prisma.user.create({
    data: {
      name: "João Gerente",
      email: "gerente@teste.com",
      cpf:"",
      password: senhaHash,
      role: Role.GERENTE,
      funcionario: {
        create: {
          cargo: Cargo.CAIXA,
          salario: 4500,
        },
      },
    },
  });

  const atendente = await prisma.user.create({
    data: {
      name: "Maria Atendente",
      email: "atendente@teste.com",
      cpf:"",
      password: senhaHash,
      role: Role.ATENDENTE,
      funcionario: {
        create: {
          cargo: Cargo.ATENDENTE,
          salario: 2000,
        },
      },
    },
  });

  console.log("✅ Usuários criados:");
  console.log(`   Gerente   → ${gerente.email}   / senha: 123456`);
  console.log(`   Atendente → ${atendente.email} / senha: 123456`);

  // ─────────────────────────────────────────
  // INGREDIENTES
  // ─────────────────────────────────────────
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
    prisma.ingrediente.create({
      data: {
        nome: "Pão Brioche",
        quantidadeAtual: 100,
        unidade: UnidadeMedida.UNIDADE,
        custoPorUnidade: 1.5,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Carne Bovina 150g",
        quantidadeAtual: 50,
        unidade: UnidadeMedida.UNIDADE,
        custoPorUnidade: 8.0,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Queijo Cheddar",
        quantidadeAtual: 200,
        unidade: UnidadeMedida.G,
        custoPorUnidade: 0.08,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Alface",
        quantidadeAtual: 30,
        unidade: UnidadeMedida.UNIDADE,
        custoPorUnidade: 0.3,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Tomate",
        quantidadeAtual: 40,
        unidade: UnidadeMedida.UNIDADE,
        custoPorUnidade: 0.5,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Bacon",
        quantidadeAtual: 100,
        unidade: UnidadeMedida.G,
        custoPorUnidade: 0.12,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Molho Especial",
        quantidadeAtual: 2,
        unidade: UnidadeMedida.LITRO,
        custoPorUnidade: 3.0,
      },
    }),
    prisma.ingrediente.create({
      data: {
        nome: "Batata Palito",
        quantidadeAtual: 10,
        unidade: UnidadeMedida.KG,
        custoPorUnidade: 4.0,
      },
    }),
  ]);

  console.log("✅ Ingredientes criados.");

  // ─────────────────────────────────────────
  // PRODUTOS
  // ─────────────────────────────────────────
  const classicBurger = await prisma.produto.create({
    data: {
      nome: "Classic Burger",
      descricao: "Pão brioche, carne 150g, alface, tomate e molho especial",
      categoria: CategoriaProduct.PRINCIPAL,
      precoVenda: 28.9,
      tempoPreparoEstimado: 12,
      ativo: true,
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
      ativo: true,
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
      ativo: true,
      ingredientes: {
        create: [
          { ingredienteId: batataPalito.id, quantidadeUsada: 0.2 },
        ],
      },
    },
  });

  const cocaCola = await prisma.produto.create({
    data: {
      nome: "Coca-Cola Lata",
      descricao: "350ml gelada",
      categoria: CategoriaProduct.BEBIDA,
      precoVenda: 6.0,
      ativo: true,
    },
  });

  const sucoLaranja = await prisma.produto.create({
    data: {
      nome: "Suco de Laranja",
      descricao: "300ml natural",
      categoria: CategoriaProduct.BEBIDA,
      precoVenda: 8.0,
      tempoPreparoEstimado: 3,
      ativo: true,
    },
  });

  console.log("✅ Produtos criados.");

  // ─────────────────────────────────────────
  // COMBOS
  // ─────────────────────────────────────────
  await prisma.combo.create({
    data: {
      nome: "Combo Classic",
      preco: 39.9,
      ativo: true,
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
      ativo: true,
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