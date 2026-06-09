import { useState } from "react";
import { PackagePlus, LayoutGrid, TrendingUp, DollarSign, Flame } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import KpiCard from "../components/Ui/KpiCard";
import CampeaoCard from "../components/Ui/CampeaoCard";
import ErrorAlert from "../components/Ui/ErrorAlert";
import { useProdutosMetricas } from "../hooks/useProdutosMetricas";
import { useProdutosTopCategoria } from "../hooks/useProdutosTopCategoria";
import { fmtBRL } from "../utils/format";
import { PERIODOS } from "../constants";

const CATEGORIAS = ["PRINCIPAL", "ACOMPANHAMENTO", "BEBIDA", "SOBREMESA"];

const KpiSkeleton = () => (
  <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-0.5 bg-slate-800" />
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 bg-slate-800 rounded w-1/2" />
        <div className="h-5 bg-slate-800 rounded w-3/4" />
        <div className="h-2 bg-slate-800 rounded w-1/3" />
      </div>
    </div>
  </div>
);

export default function Produtos() {
  const [periodo, setPeriodo] = useState("7dias");
  const { dados, loading, erro }                   = useProdutosMetricas(periodo);
  const { dados: topCat, loading: topCatLoading, erro: topCatErro } = useProdutosTopCategoria(periodo);

  const deltaLabel = PERIODOS.find((p) => p.value === periodo)?.vsLabel ?? "";

  const cards = dados
    ? [
        {
          icon:       LayoutGrid,
          label:      "No cardápio",
          value:      String(dados.cardapio.total),
          deltaLabel: `${dados.cardapio.ativos} ativos`,
        },
        {
          icon:       TrendingUp,
          label:      "Margem média",
          value:      `${dados.margemMedia.valor.toFixed(1)}%`,
          deltaLabel: "lucro sobre custo",
        },
        {
          icon:       DollarSign,
          label:      "Mais lucrativo",
          value:      dados.maisLucrativo.nome,
          deltaLabel: `+${fmtBRL(dados.maisLucrativo.lucro)} / unidade`,
        },
        {
          icon:       Flame,
          label:      "Campeão de vendas",
          value:      dados.campeaoVendas.nome,
          delta:      dados.campeaoVendas.variacao,
          deltaLabel: `${dados.campeaoVendas.qtd} vendidos · ${deltaLabel}`,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <HeaderBar
        title="Produtos"
        subtitle="Gerencie o cardápio, categorias e preços"
        period={periodo}
        setPeriod={setPeriodo}
        periods={PERIODOS}
      />

      {erro && !loading && <ErrorAlert message={erro} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : cards.map((c) => <KpiCard key={c.label} size="compact" {...c} />)
        }
      </div>

      {/* Campeões por categoria */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold ml-4 shrink-0">
            Campeões por categoria
          </h2>
          <span className="text-slate-500 text-[11px]">· mais vendidos no período</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        {topCatErro && !topCatLoading && <ErrorAlert message={topCatErro} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCatLoading
            ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            : CATEGORIAS.map((cat) => (
                <CampeaoCard
                  key={cat}
                  categoria={cat}
                  produto={topCat?.find((p) => p.categoria === cat) ?? null}
                />
              ))
          }
        </div>
      </div>
    </div>
  );
}
