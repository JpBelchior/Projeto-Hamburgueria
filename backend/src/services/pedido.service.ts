import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido, CategoriaProduct } from "@prisma/client";
import { CreatePedidoDTO, PedidoItemDTO, UpdatePedidoDTO, UpdateStatusDTO, ListPedidosDTO } from "../dto/pedido.dto";
import { DateRange, Periodo, getRanges } from "../utils/dateRange";

async function validarItensRestaurante(itens: PedidoItemDTO[], restauranteId: number) {
  const produtoIds  = [...new Set(itens.filter(i => i.produtoId).map(i => i.produtoId!))];
  const comboIds    = [...new Set(itens.filter(i => i.comboId).map(i => i.comboId!))];
  const promocaoIds = [...new Set(itens.filter(i => i.promocaoId).map(i => i.promocaoId!))];

  const [produtos, combos, promocoes] = await Promise.all([
    produtoIds.length  > 0 ? prisma.produto.findMany({ where: { id: { in: produtoIds },  restauranteId }, select: { id: true } }) : [],
    comboIds.length    > 0 ? prisma.combo.findMany(  { where: { id: { in: comboIds },    restauranteId }, select: { id: true } }) : [],
    promocaoIds.length > 0 ? prisma.promocao.findMany({ where: { id: { in: promocaoIds }, restauranteId }, select: { id: true } }) : [],
  ]);

  const idsProdutos  = new Set(produtos.map(p => p.id));
  const idsCombos    = new Set(combos.map(c => c.id));
  const idsPromocoes = new Set(promocoes.map(p => p.id));

  for (const item of itens) {
    if (item.produtoId  && !idsProdutos.has(item.produtoId))   throw Object.assign(new Error("Produto inválido para este restaurante."),  { statusCode: 400 });
    if (item.comboId    && !idsCombos.has(item.comboId))       throw Object.assign(new Error("Combo inválido para este restaurante."),    { statusCode: 400 });
    if (item.promocaoId && !idsPromocoes.has(item.promocaoId)) throw Object.assign(new Error("Promoção inválida para este restaurante."), { statusCode: 400 });
  }
}

function calcVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}


async function calcMetricas(restauranteId: number, range: DateRange) {
  const where = {
    restauranteId,
    status:    StatusPedido.FINALIZADO,
    createdAt: { gte: range.inicio, lt: range.fim },
  };

  const agg = await prisma.pedido.aggregate({
    where,
    _sum:   { valorTotal: true },
    _count: { id: true },
  });

  const faturamento = agg._sum.valorTotal ?? 0;
  const pedidos     = agg._count.id;
  const ticketMedio = pedidos > 0 ? faturamento / pedidos : 0;

  const comPrincipal = await prisma.pedido.findMany({
    where: {
      ...where,
      tempoInicioPreparo: { not: null },
      tempoFimPreparo:    { not: null },
      itens: {
        some: {
          OR: [
            { produto: { categoria: CategoriaProduct.PRINCIPAL } },
            { combo: { produtos: { some: { produto: { categoria: CategoriaProduct.PRINCIPAL } } } } },
          ],
        },
      },
    },
    select: { tempoInicioPreparo: true, tempoFimPreparo: true },
  });

  const tempoPreparo =
    comPrincipal.length === 0
      ? 0
      : comPrincipal.reduce((acc, p) => {
          return acc + (p.tempoFimPreparo!.getTime() - p.tempoInicioPreparo!.getTime()) / 60_000;
        }, 0) / comPrincipal.length;

  return { faturamento, pedidos, ticketMedio, tempoPreparo };
}

const DIAS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type VendasRow = { hora?: bigint | number; data?: Date | string; mes?: bigint | number; faturamento: number | string; pedidos: bigint | number };

export const getVendas = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const status = StatusPedido.FINALIZADO;

  if (periodo === "hoje") {
    const rows = await prisma.$queryRaw<VendasRow[]>`
      SELECT HOUR(createdAt) AS hora,
             CAST(SUM(valorTotal) AS DECIMAL(10,2)) AS faturamento,
             COUNT(id) AS pedidos
      FROM pedidos
      WHERE restauranteId = ${restauranteId}
        AND status = ${status}
        AND DATE(createdAt) = CURDATE()
      GROUP BY HOUR(createdAt)
      ORDER BY hora
    `;
    const currentHour = new Date().getHours();
    return Array.from({ length: currentHour + 1 }, (_, h) => {
      const row = rows.find((r) => Number(r.hora) === h);
      return { label: `${String(h).padStart(2, "0")}h`, faturamento: Number(row?.faturamento ?? 0), pedidos: Number(row?.pedidos ?? 0) };
    });
  }

  if (periodo === "7dias") {
    const rows = await prisma.$queryRaw<VendasRow[]>`
      SELECT DATE(createdAt) AS data,
             CAST(SUM(valorTotal) AS DECIMAL(10,2)) AS faturamento,
             COUNT(id) AS pedidos
      FROM pedidos
      WHERE restauranteId = ${restauranteId}
        AND status = ${status}
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY data
    `;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const row = rows.find((r) => {
        const rd = r.data instanceof Date ? r.data : new Date(r.data as string);
        return rd.toISOString().split("T")[0] === dateStr;
      });
      return { label: i === 6 ? "Hoje" : DIAS_PT[d.getDay()], faturamento: Number(row?.faturamento ?? 0), pedidos: Number(row?.pedidos ?? 0) };
    });
  }

  if (periodo === "30dias") {
    const rows = await prisma.$queryRaw<VendasRow[]>`
      SELECT DATE(createdAt) AS data,
             CAST(SUM(valorTotal) AS DECIMAL(10,2)) AS faturamento,
             COUNT(id) AS pedidos
      FROM pedidos
      WHERE restauranteId = ${restauranteId}
        AND status = ${status}
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY data
    `;
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      const row = rows.find((r) => {
        const rd = r.data instanceof Date ? r.data : new Date(r.data as string);
        return rd.toISOString().split("T")[0] === dateStr;
      });
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label, faturamento: Number(row?.faturamento ?? 0), pedidos: Number(row?.pedidos ?? 0) };
    });
  }

  // anual
  const rows = await prisma.$queryRaw<VendasRow[]>`
    SELECT MONTH(createdAt) AS mes,
           CAST(SUM(valorTotal) AS DECIMAL(10,2)) AS faturamento,
           COUNT(id) AS pedidos
    FROM pedidos
    WHERE restauranteId = ${restauranteId}
      AND status = ${status}
      AND YEAR(createdAt) = YEAR(NOW())
    GROUP BY MONTH(createdAt)
    ORDER BY mes
  `;
  const currentMonth = new Date().getMonth() + 1;
  return Array.from({ length: currentMonth }, (_, i) => {
    const m = i + 1;
    const row = rows.find((r) => Number(r.mes) === m);
    return { label: MESES_PT[i], faturamento: Number(row?.faturamento ?? 0), pedidos: Number(row?.pedidos ?? 0) };
  });
};

export const getCategoriaMix = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  type Row = { categoria: string; qtd: bigint | number };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT categoria, SUM(qtd) AS qtd FROM (
      SELECT p.categoria,
             SUM(pi.quantidade) AS qtd
      FROM pedido_itens pi
      JOIN produtos     p   ON p.id   = pi.produtoId
      JOIN pedidos      ped ON ped.id = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND pi.produtoId IS NOT NULL
      GROUP BY p.categoria

      UNION ALL

      SELECT p.categoria,
             SUM(pi.quantidade * cp.quantidade) AS qtd
      FROM pedido_itens  pi
      JOIN combo_produtos cp  ON cp.comboId  = pi.comboId
      JOIN produtos       p   ON p.id        = cp.produtoId
      JOIN pedidos        ped ON ped.id      = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND pi.comboId IS NOT NULL
      GROUP BY p.categoria
    ) combined
    GROUP BY categoria
    ORDER BY qtd DESC
  `;

  return rows.map((r) => ({
    categoria: r.categoria,
    qtd:       Number(r.qtd),
  }));
};

export const getTopItens = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  type Row = { id: bigint | number; nome: string; categoria: string; qtd: bigint | number; receita: number | string };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT id, nome, categoria, qtd, receita FROM (
      SELECT p.id,
             p.nome,
             p.categoria,
             SUM(pi.quantidade) AS qtd,
             CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2)) AS receita
      FROM pedido_itens pi
      JOIN produtos     p   ON p.id   = pi.produtoId
      JOIN pedidos      ped ON ped.id = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND pi.produtoId IS NOT NULL
      GROUP BY p.id, p.nome, p.categoria

      UNION ALL

      SELECT c.id,
             c.nome,
             'COMBO' AS categoria,
             SUM(pi.quantidade) AS qtd,
             CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2)) AS receita
      FROM pedido_itens pi
      JOIN combos       c   ON c.id   = pi.comboId
      JOIN pedidos      ped ON ped.id = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND pi.comboId IS NOT NULL
      GROUP BY c.id, c.nome
    ) combined
    ORDER BY qtd DESC
    LIMIT 5
  `;

  return rows.map((r) => ({
    id:        Number(r.id),
    nome:      r.nome,
    categoria: r.categoria,
    qtd:       Number(r.qtd),
    receita:   Number(r.receita),
  }));
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const pedidoInclude = {
  itens: {
    include: {
      produto:  { select: { id: true, nome: true, categoria: true } },
      combo: {
        select: {
          id:   true,
          nome: true,
          produtos: {
            select: {
              quantidade: true,
              produto: { select: { nome: true, categoria: true } },
            },
          },
        },
      },
      promocao: {
        select: {
          id: true,
          nome: true,
          combos: {
            select: {
              quantidade: true,
              combo: { select: { id: true, nome: true } },
            },
          },
          produtos: {
            select: {
              quantidade: true,
              produto: { select: { id: true, nome: true } },
            },
          },
        },
      },
    },
  },
  funcionario: { select: { id: true, user: { select: { name: true } } } },
};

export const listarPedidos = async (filtros: ListPedidosDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { periodo = "hoje", status, formaPagamento } = filtros;

  const { atual } = getRanges(periodo as Periodo);

  const where: Record<string, unknown> = {
    restauranteId,
    createdAt: { gte: atual.inicio },
  };

  if (status)         where.status         = status;
  if (formaPagamento) where.formaPagamento = formaPagamento;

  return prisma.pedido.findMany({
    where,
    include:  pedidoInclude,
    orderBy:  { createdAt: "desc" },
  });
};

export const buscarPedido = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.pedido.findFirst({
    where:   { id, restauranteId },
    include: pedidoInclude,
  });
};

export const criarPedido = async (dto: CreatePedidoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const funcionario   = RequestContext.getUser()!;

  const func = dto.funcionarioId
    ? await prisma.funcionario.findFirst({
        where:  { id: dto.funcionarioId, restauranteId },
        select: { id: true },
      })
    : await prisma.funcionario.findFirst({
        where:  { user: { id: funcionario.id }, restauranteId },
        select: { id: true },
      });
  if (!func) throw Object.assign(new Error("Funcionário não encontrado para este restaurante."), { statusCode: 400 });

  for (const item of dto.itens) {
    if (!item.produtoId && !item.comboId && !item.promocaoId) {
      throw Object.assign(new Error("Cada item do pedido deve referenciar ao menos um produto, combo ou promoção."), { statusCode: 400 });
    }
  }

  await validarItensRestaurante(dto.itens, restauranteId);

  type MaxRow = { maxNum: bigint | number | null };
  const [row] = await prisma.$queryRaw<MaxRow[]>`
    SELECT MAX(CAST(SUBSTRING(numeroPedido, 2) AS UNSIGNED)) AS maxNum
    FROM pedidos
    WHERE restauranteId = ${restauranteId}
  `;
  const numeroPedido = `P${String(Number(row?.maxNum ?? 0) + 1).padStart(4, "0")}`;

  const valorTotal = dto.itens.reduce(
    (acc, item) => acc + item.quantidade * item.precoUnitario,
    0,
  );

  return prisma.pedido.create({
    data: {
      numeroPedido,
      restauranteId,
      funcionarioId:  func.id,
      nomeCliente:    dto.nomeCliente,
      mesa:           dto.mesa,
      formaPagamento: dto.formaPagamento,
      valorTotal,
      itens: {
        create: dto.itens.map((item) => ({
          produtoId:     item.produtoId,
          comboId:       item.comboId,
          promocaoId:    item.promocaoId,
          quantidade:    item.quantidade,
          precoUnitario: item.precoUnitario,
          observacao:    item.observacao,
        })),
      },
    },
    include: pedidoInclude,
  });
};

export const editarPedido = async (id: number, dto: UpdatePedidoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const existente = await prisma.pedido.findFirst({ where: { id, restauranteId } });
  if (!existente) return null;

  if (dto.itens) {
    for (const item of dto.itens) {
      if (!item.produtoId && !item.comboId && !item.promocaoId) {
        throw Object.assign(new Error("Cada item do pedido deve referenciar ao menos um produto, combo ou promoção."), { statusCode: 400 });
      }
    }
    await validarItensRestaurante(dto.itens, restauranteId);
  }

  const valorTotal = dto.itens
    ? dto.itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0)
    : undefined;

  return prisma.pedido.update({
    where: { id },
    data: {
      nomeCliente:    dto.nomeCliente,
      mesa:           dto.mesa,
      formaPagamento: dto.formaPagamento,
      ...(valorTotal !== undefined && { valorTotal }),
      ...(dto.itens && {
        itens: {
          deleteMany: {},
          create: dto.itens.map((item) => ({
            produtoId:     item.produtoId,
            comboId:       item.comboId,
            promocaoId:    item.promocaoId,
            quantidade:    item.quantidade,
            precoUnitario: item.precoUnitario,
            observacao:    item.observacao,
          })),
        },
      }),
    },
    include: pedidoInclude,
  });
};

export const atualizarStatus = async (id: number, dto: UpdateStatusDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const pedido = await prisma.pedido.findFirst({ where: { id, restauranteId } });
  if (!pedido) return null;

  const now  = new Date();
  const data: Record<string, unknown> = { status: dto.status };

  if (dto.status === StatusPedido.EM_PREPARO && !pedido.tempoInicioPreparo) {
    data.tempoInicioPreparo = now;
  }
  if (dto.status === StatusPedido.FINALIZADO && !pedido.tempoFimPreparo) {
    data.tempoFimPreparo = now;
  }

  return prisma.pedido.update({
    where:   { id },
    data,
    include: pedidoInclude,
  });
};

export const cancelarPedido = async (id: number) => {
  return atualizarStatus(id, { status: StatusPedido.CANCELADO });
};

export const deletarPedido = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const pedido = await prisma.pedido.findFirst({ where: { id, restauranteId } });
  if (!pedido) return null;
  await prisma.pedido.delete({ where: { id } });
  return true;
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getMetricas = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual, anterior } = getRanges(periodo);

  type TopRow = { nome: string; qtd: bigint | number };

  const [[m1, m2], maisVendidoRows] = await Promise.all([
    Promise.all([
      calcMetricas(restauranteId, atual),
      calcMetricas(restauranteId, anterior),
    ]),
    prisma.$queryRaw<TopRow[]>`
      SELECT nome, qtd FROM (
        SELECT p.nome, SUM(pi.quantidade) AS qtd
        FROM pedido_itens pi
        JOIN produtos p   ON p.id   = pi.produtoId
        JOIN pedidos  ped ON ped.id = pi.pedidoId
        WHERE ped.restauranteId = ${restauranteId}
          AND ped.status        = ${StatusPedido.FINALIZADO}
          AND ped.createdAt    >= ${atual.inicio}
          AND ped.createdAt     < ${atual.fim}
          AND pi.produtoId IS NOT NULL
        GROUP BY p.id, p.nome

        UNION ALL

        SELECT c.nome, SUM(pi.quantidade) AS qtd
        FROM pedido_itens pi
        JOIN combos  c   ON c.id   = pi.comboId
        JOIN pedidos ped ON ped.id = pi.pedidoId
        WHERE ped.restauranteId = ${restauranteId}
          AND ped.status        = ${StatusPedido.FINALIZADO}
          AND ped.createdAt    >= ${atual.inicio}
          AND ped.createdAt     < ${atual.fim}
          AND pi.comboId IS NOT NULL
        GROUP BY c.id, c.nome
      ) combined
      ORDER BY qtd DESC
      LIMIT 1
    `,
  ]);

  const maisVendido = maisVendidoRows[0]
    ? { nome: maisVendidoRows[0].nome, qtd: Number(maisVendidoRows[0].qtd) }
    : null;

  return {
    faturamento:  { valor: m1.faturamento,                          variacao: calcVariacao(m1.faturamento,  m2.faturamento)  },
    pedidos:      { valor: m1.pedidos,                              variacao: calcVariacao(m1.pedidos,      m2.pedidos)      },
    ticketMedio:  { valor: Math.round(m1.ticketMedio  * 100) / 100, variacao: calcVariacao(m1.ticketMedio,  m2.ticketMedio)  },
    tempoPreparo: { variacao: calcVariacao(m1.tempoPreparo, m2.tempoPreparo) },
    maisVendido,
  };
};
