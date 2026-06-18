import { Timer, ClipboardList, TrendingUp } from "lucide-react";
import { fmtBRL, STATUS_COLOR, STATUS_LABEL } from "../../utils/format";
import CardContainer from "../Ui/CardContainer";
import KpiCard from "../Ui/KpiCard";
import { STATUS_COLS } from "../../constants";

function mkHint(variacao, vsHint, { invertido = false } = {}) {
  if (variacao == null) return "Sem dados do período anterior para comparação";
  if (variacao === 0)   return "Igual ao período anterior";
  const abs = Math.abs(variacao).toFixed(1);
  if (invertido) return variacao < 0 ? `${abs}% mais rápido ${vsHint}` : `${abs}% mais lento ${vsHint}`;
  return variacao > 0 ? `${abs}% a mais ${vsHint}` : `${abs}% a menos ${vsHint}`;
}

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
        deltaHint={metricas ? mkHint(metricas.pedidos.variacao, vsHint) : undefined}
      />
      <KpiCard
        icon={TrendingUp}
        label="Ticket Médio"
        value={fmtBRL(ticketMedio)}
        deltaLabel="por pedido"
        delta={metricas?.ticketMedio?.variacao}
        deltaHint={metricas ? mkHint(metricas.ticketMedio.variacao, vsHint) : undefined}
      />
      <KpiCard
        icon={Timer}
        label="Tempo Médio de Preparo"
        value={tempoPreparo > 0 ? `${tempoPreparo} min` : "—"}
        deltaLabel={comTempo.length > 0 ? `${comTempo.length} pedidos c/ Principal` : "sem dados"}
        hint="Média do tempo entre o pedido entrar em preparo e ser finalizado, contando apenas pedidos com ao menos um item da categoria Principal."
        delta={metricas?.tempoPreparo?.variacao}
        deltaHint={metricas ? mkHint(metricas.tempoPreparo?.variacao, vsHint, { invertido: true }) : undefined}
        invertido
      />

      {/* Mix por status */}
      <CardContainer className="hover:border-slate-600 transition-all relative">
        <div className="px-5 py-4">
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
          Mix por Status
        </p>

        {/* Barra colorida */}
        <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-0.5">
          {STATUS_COLS.map((s) => (
            contagem[s] > 0 && (
              <div
                key={s}
                className="rounded-full transition-all duration-500"
                style={{
                  flex:       contagem[s],
                  background: STATUS_COLOR[s],
                }}
              />
            )
          ))}
        </div>

        {/* Legendas */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {STATUS_COLS.map((s) => (
            <span key={s} className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[s] }} />
              {STATUS_LABEL[s]} {contagem[s]}
            </span>
          ))}
        </div>
        </div>
      </CardContainer>
    </div>
  );
}
