import { Timer, ClipboardList, TrendingUp } from "lucide-react";
import { fmtBRL, STATUS_COLOR, STATUS_LABEL, deltaHint } from "../../utils/format";
import MixBar from "../Ui/MixBar";
import KpiCard from "../Ui/KpiCard";
import { STATUS_COLS } from "../../constants";

export default function PedidosStats({ pedidos, metricas, vsHint = "que o período anterior" }) {
  const ativos      = pedidos.filter((p) => p.status !== "CANCELADO");
  const faturamento = ativos.reduce((s, p) => s + p.valorTotal, 0);
  const ticketMedio = ativos.length > 0 ? faturamento / ativos.length : 0;
  const total       = pedidos.length;

  const comTempo = pedidos.filter(
    (p) =>
      p.status === "FINALIZADO" &&
      p.tempoInicioPreparo &&
      p.tempoFimPreparo &&
      p.itens?.some(
        (item) =>
          item.produto?.categoria === "PRINCIPAL" ||
          item.combo?.produtos?.some((cp) => cp.produto?.categoria === "PRINCIPAL"),
      ),
  );
  const tempoPreparo =
    comTempo.length === 0
      ? 0
      : Math.round(
          (comTempo.reduce(
            (acc, p) =>
              acc +
              (new Date(p.tempoFimPreparo).getTime() - new Date(p.tempoInicioPreparo).getTime()) / 60_000,
            0,
          ) /
            comTempo.length) *
            10,
        ) / 10;

  const contagem = STATUS_COLS.reduce((acc, s) => {
    acc[s] = pedidos.filter((p) => p.status === s).length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard
        icon={ClipboardList}
        label="Pedidos no período"
        value={String(total)}
        deltaLabel={`${ativos.length} ativos`}
        delta={metricas?.pedidos?.variacao}
        deltaHint={metricas ? deltaHint(metricas.pedidos.variacao, vsHint) : undefined}
      />
      <KpiCard
        icon={TrendingUp}
        label="Ticket Médio"
        value={fmtBRL(ticketMedio)}
        deltaLabel="por pedido"
        delta={metricas?.ticketMedio?.variacao}
        deltaHint={metricas ? deltaHint(metricas.ticketMedio.variacao, vsHint) : undefined}
      />
      <KpiCard
        icon={Timer}
        label="Tempo Médio de Preparo"
        value={tempoPreparo > 0 ? `${tempoPreparo} min` : "—"}
        deltaLabel={comTempo.length > 0 ? `${comTempo.length} pedidos c/ Principal` : "sem dados"}
        hint="Média do tempo entre o pedido entrar em preparo e ser finalizado, contando apenas pedidos com ao menos um item da categoria Principal."
        delta={metricas?.tempoPreparo?.variacao}
        deltaHint={metricas ? deltaHint(metricas.tempoPreparo?.variacao, vsHint, { invertido: true }) : undefined}
        invertido
      />

      <MixBar
        title="Mix por Status"
        items={STATUS_COLS.map((s) => ({ key: s, label: STATUS_LABEL[s], color: STATUS_COLOR[s], value: contagem[s] }))}
      />
    </div>
  );
}
