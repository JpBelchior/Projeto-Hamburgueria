import { DollarSign, ClipboardList, TrendingUp, Trophy } from "lucide-react";
import KpiCard from "../Ui/KpiCard";
import { formatMoeda } from "../../utils/Date.utils";

function deltaHint(variacao, vsHint, { invertido = false } = {}) {
  if (variacao === null) return "Sem dados do período anterior para comparação";
  if (variacao === 0)    return "Igual ao período anterior";
  const abs = Math.abs(variacao).toFixed(1);
  if (invertido) return variacao < 0 ? `${abs}% mais rápido ${vsHint}` : `${abs}% mais lento ${vsHint}`;
  return variacao > 0 ? `${abs}% a mais ${vsHint}` : `${abs}% a menos ${vsHint}`;
}

export default function DashboardKpis({ dados, deltaLabel, vsHint }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={DollarSign}
        label="Faturamento"
        value={formatMoeda(dados.faturamento.valor)}
        delta={dados.faturamento.variacao}
        deltaLabel={deltaLabel}
        hint="Faturamento total dos pedidos no periodo selecionado"
        deltaHint={deltaHint(dados.faturamento.variacao, vsHint)}
      />
      <KpiCard
        icon={ClipboardList}
        label="Pedidos"
        value={String(dados.pedidos.valor)}
        delta={dados.pedidos.variacao}
        deltaLabel={deltaLabel}
        hint="Números de pedidos no periodo selecionado"
        deltaHint={deltaHint(dados.pedidos.variacao, vsHint)}
      />
      <KpiCard
        icon={TrendingUp}
        label="Ticket Médio"
        value={formatMoeda(dados.ticketMedio.valor)}
        delta={dados.ticketMedio.variacao}
        deltaLabel={`${deltaLabel} · faturamento ÷ pedidos`}
        hint="Faturamento dividido pelo número de pedidos no periodo selecionado."
        deltaHint={deltaHint(dados.ticketMedio.variacao, vsHint)}
      />
      <KpiCard
        icon={Trophy}
        label="Mais Vendido"
        value={dados.maisVendido?.nome ?? "—"}
        deltaLabel={dados.maisVendido ? `${dados.maisVendido.qtd} vendidos no período` : "sem pedidos finalizados"}
        hint="Item ou combo mais pedido entre os pedidos finalizados no período selecionado."
      />
    </div>
  );
}
