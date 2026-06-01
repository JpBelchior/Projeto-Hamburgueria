import { useState, useCallback } from "react";
import { DollarSign, ClipboardList, TrendingUp, Timer, Zap, AlertCircle } from "lucide-react";
import KpiCard from "../components/Ui/KpiCard";
import HeaderBar from "../components/Ui/HeaderBar";
import FinanceiroCard from "../components/Dashboard/FinanceiroCard";
import SalesChart from "../components/Dashboard/SalesChart";
import { useDashboard } from "../hooks/useDashboard";
import { formatMoeda } from "../utils/Date.utils";

const PERIODOS = [
  { key: "hoje",   label: "Hoje",    vsLabel: "vs ontem"        },
  { key: "7dias",  label: "7 dias",  vsLabel: "vs sem. passada" },
  { key: "30dias", label: "30 dias", vsLabel: "vs mês passado"  },
  { key: "anual",  label: "Anual",   vsLabel: "vs ano passado"  },
];

// ── Skeletons de loading ──────────────────────────────────────────────────

const KpiSkeleton = () => (
  <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-xl bg-slate-700/60" />
      <div className="w-14 h-5 rounded-full bg-slate-700/60" />
    </div>
    <div className="flex flex-col gap-1.5">
      <div className="w-24 h-3 rounded bg-slate-700/60" />
      <div className="w-32 h-7 rounded bg-slate-700/60" />
    </div>
    <div className="w-16 h-3 rounded bg-slate-700/60" />
  </div>
);

// ── Página ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [periodo, setPeriodo] = useState("hoje");

  const { dados, loading, erro, refetch } = useDashboard(periodo);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const deltaLabel = PERIODOS.find((p) => p.key === periodo)?.vsLabel ?? "";

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
        periods={PERIODOS.map((p) => ({ value: p.key, label: p.label }))}
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
      {erro && !loading && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{erro}</p>
        </div>
      )}

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
    </div>
  );
};

export default Dashboard;
