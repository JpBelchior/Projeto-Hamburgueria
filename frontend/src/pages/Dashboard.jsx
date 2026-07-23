import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import ErrorAlert from "../components/Ui/ErrorAlert";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import HeaderBar from "../components/Ui/HeaderBar";
import DashboardKpis from "../components/Dashboard/DashboardKpis";
import FinanceiroCard from "../components/Dashboard/FinanceiroCard";
import SalesChart from "../components/Dashboard/SalesChart";
import TopItens from "../components/Dashboard/TopItens";
import CategoriaMix from "../components/Dashboard/CategoriaMix";
import { useDashboard } from "../hooks/useDashboard";
import { PERIODOS } from "../constants";

const Dashboard = () => {
  const [periodo, setPeriodo] = useState("30dias");

  const { dados, loading, erro, refetch } = useDashboard(periodo);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const periodoAtual = PERIODOS.find((p) => p.value === periodo);
  const deltaLabel   = periodoAtual?.vsLabel ?? "";
  const vsHint       = periodoAtual?.vsHint  ?? "que o período anterior";

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
      {loading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}</div>
        : dados && <DashboardKpis dados={dados} deltaLabel={deltaLabel} vsHint={vsHint} />
      }

      {/* Análise Financeira */}
      <FinanceiroCard />

      {/* Gráfico de vendas */}
      <SalesChart
        period={periodo}
        refreshing={loading}
        variacaoFaturamento={dados?.faturamento?.variacao}
        variacaoPedidos={dados?.pedidos?.variacao}
        vsHint={vsHint}
      />

      {/* Ranking e mix de categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItens period={periodo} />
        <CategoriaMix period={periodo} />
      </div>
    </div>
  );
};

export default Dashboard;
