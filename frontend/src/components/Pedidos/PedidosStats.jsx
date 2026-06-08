import { DollarSign, ClipboardList, TrendingUp } from "lucide-react";
import { fmtBRL, STATUS_COLOR, STATUS_LABEL } from "../../utils/format";
import CardContainer from "../Ui/CardContainer";
import KpiCard from "../Ui/KpiCard";
import { STATUS_COLS } from "../../constants";

export default function PedidosStats({ pedidos }) {
  const ativos      = pedidos.filter((p) => p.status !== "CANCELADO");
  const faturamento = ativos.reduce((s, p) => s + p.valorTotal, 0);
  const ticketMedio = ativos.length > 0 ? faturamento / ativos.length : 0;
  const total       = pedidos.length;

  const contagem = STATUS_COLS.reduce((acc, s) => {
    acc[s] = pedidos.filter((p) => p.status === s).length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard size="compact" icon={ClipboardList} label="Pedidos no período" value={String(total)}     deltaLabel={`${ativos.length} ativos`} />
      <KpiCard size="compact" icon={DollarSign}    label="Faturamento"        value={fmtBRL(faturamento)} deltaLabel="exclui cancelados" />
      <KpiCard size="compact" icon={TrendingUp}    label="Ticket Médio"       value={fmtBRL(ticketMedio)} deltaLabel="por pedido" />

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
