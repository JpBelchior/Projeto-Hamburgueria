import { AlertCircle } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import PedidosStats from "../components/Pedidos/PedidosStats";
import PedidosFilters from "../components/Pedidos/PedidosFilters";
import PedidosKanban from "../components/Pedidos/PedidosKanban";
import PedidosDrawer from "../components/Pedidos/PedidosDrawer";
import ComandaModal from "../components/Pedidos/ComandaModal";
import { usePedidos } from "../hooks/usePedidos";
import { PERIODOS } from "../constants";

export default function Pedidos() {
  const { filtered, loading, error, filters, drawer, comanda, tick, refetch, actions } = usePedidos();

  return (
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Pedidos"
        subtitle="Gerencie o fluxo da fila — abertos, em preparo e finalizados"
        period={filters.periodo}
        setPeriod={(v) => actions.setFilter("periodo", v)}
        periods={PERIODOS}
        onRefresh={refetch}
        refreshing={loading}
      />

      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <PedidosStats pedidos={filtered} />

      <PedidosFilters
        filters={filters}
        setFilter={actions.setFilter}
        resetFilters={actions.resetFilters}
        onNewPedido={actions.openCreate}
      />

      <PedidosKanban pedidos={filtered} tick={tick} actions={actions} />

      <p className="text-center text-slate-700 text-[10px] py-2 tracking-wider uppercase">
        Arraste cards entre colunas para mudar o status · clique para editar
      </p>

      <PedidosDrawer state={{ drawer }} actions={actions} />
      <ComandaModal  state={{ comanda }} actions={actions} />
    </div>
  );
}
