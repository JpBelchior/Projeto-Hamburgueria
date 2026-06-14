import { useState, useCallback } from "react";
import { DollarSign, ClipboardList, TrendingUp, Timer, Zap } from "lucide-react";
import ErrorAlert from "../components/Ui/ErrorAlert";
import KpiCard from "../components/Ui/KpiCard";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import HeaderBar from "../components/Ui/HeaderBar";
import FinanceiroCard from "../components/Dashboard/FinanceiroCard";
import SalesChart from "../components/Dashboard/SalesChart";
import TopItens from "../components/Dashboard/TopItens";
import CategoriaMix from "../components/Dashboard/CategoriaMix";
import { useDashboard } from "../hooks/useDashboard";
import { formatMoeda } from "../utils/Date.utils";
import { PERIODOS } from "../constants";

// ── Página ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [periodo, setPeriodo] = useState("30dias");

  const { dados, loading, erro, refetch } = useDashboard(periodo);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const deltaLabel = PERIODOS.find((p) => p.value === periodo)?.vsLabel ?? "";

  const kpis = dados
    ? [
        {
          icon:       DollarSign,
          label:      "Faturamento",
          value:      formatMoeda(dados.faturamento.valor),
          delta:      dados.faturamento.variacao,
          deltaLabel,
        },
        {
          icon:       ClipboardList,
          label:      "Pedidos",
          value:      String(dados.pedidos.valor),
          delta:      dados.pedidos.variacao,
          deltaLabel,
        },
        {
          icon:       TrendingUp,
          label:      "Ticket Médio",
          value:      formatMoeda(dados.ticketMedio.valor),
          delta:      dados.ticketMedio.variacao,
          deltaLabel: `${deltaLabel} · faturamento ÷ pedidos`,
          hint:       "Faturamento dividido pelo número de pedidos",
        },
        {
          icon:       Timer,
          label:      "Tempo Médio de Preparo",
          value:      dados.tempoPreparo.valor > 0 ? `${dados.tempoPreparo.valor} min` : "—",
          delta:      dados.tempoPreparo.variacao,
          deltaLabel: `${deltaLabel} · só pedidos c/ Principal`,
          hint:       "Calculado apenas para pedidos que contêm um item Principal",
          invertido:  true,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <HeaderBar
        title="Dashboard"
        period={periodo}
        setPeriod={setPeriodo}
        periods={PERIODOS}
        onRefresh={handleRefresh}
        refreshing={loading}
      />

      {/* Insight */}
      <div className="flex items-start gap-3 bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3">
        <Zap size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold uppercase tracking-wide text-[10px] mr-2">
            Insight do dia
          </span>
          Os dados abaixo refletem os pedidos finalizados no período selecionado.
        </p>
      </div>

      {/* Erro */}
      {erro && !loading && <ErrorAlert message={erro} />}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)
        }
      </div>

      {/* Análise Financeira */}
      <FinanceiroCard />

      {/* Gráfico de vendas */}
      <SalesChart period={periodo} refreshing={loading} />

      {/* Ranking e mix de categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItens period={periodo} />
        <CategoriaMix period={periodo} />
      </div>
    </div>
  );
};

export default Dashboard;
