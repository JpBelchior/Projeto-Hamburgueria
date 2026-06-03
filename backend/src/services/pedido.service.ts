import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido, CategoriaProduct } from "@prisma/client";

type Periodo = "hoje" | "7dias" | "30dias" | "anual";

interface DateRange { inicio: Date; fim: Date }

function getRanges(periodo: Periodo): { atual: DateRange; anterior: DateRange } {
  const now  = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ms   = (d: number) => d * 86_400_000;

  switch (periodo) {
    case "hoje":
      return {
        atual:    { inicio: hoje,                              fim: now  },
        anterior: { inicio: new Date(hoje.getTime() - ms(1)), fim: hoje },
      };
    case "7dias":
      return {
        atual:    { inicio: new Date(hoje.getTime() - ms(7)),  fim: now },
        anterior: { inicio: new Date(hoje.getTime() - ms(14)), fim: new Date(hoje.getTime() - ms(7)) },
      };
    case "30dias":
      return {
        atual:    { inicio: new Date(hoje.getTime() - ms(30)), fim: now },
        anterior: { inicio: new Date(hoje.getTime() - ms(60)), fim: new Date(hoje.getTime() - ms(30)) },
      };
    case "anual":
      return {
        atual:    { inicio: new Date(now.getFullYear(), 0, 1),     fim: now },
        anterior: { inicio: new Date(now.getFullYear() - 1, 0, 1), fim: new Date(now.getFullYear(), 0, 1) },
      };
  }
}

function calcVariacao(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
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
      itens: { some: { produto: { categoria: CategoriaProduct.PRINCIPAL } } },
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
    SELECT p.id, p.nome, p.categoria,
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

export const getMetricas = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual, anterior } = getRanges(periodo);

  const [m1, m2] = await Promise.all([
    calcMetricas(restauranteId, atual),
    calcMetricas(restauranteId, anterior),
  ]);

  return {
    faturamento:  { valor: m1.faturamento,                          variacao: calcVariacao(m1.faturamento,  m2.faturamento)  },
    pedidos:      { valor: m1.pedidos,                              variacao: calcVariacao(m1.pedidos,      m2.pedidos)      },
    ticketMedio:  { valor: Math.round(m1.ticketMedio  * 100) / 100, variacao: calcVariacao(m1.ticketMedio,  m2.ticketMedio)  },
    tempoPreparo: { valor: Math.round(m1.tempoPreparo * 10)  / 10,  variacao: calcVariacao(m1.tempoPreparo, m2.tempoPreparo) },
  };
};
