import { useState, useCallback, useMemo } from "react";
import { ShoppingCart, Users, DollarSign, TrendingDown, Plus } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import KpiCard from "../components/Ui/KpiCard";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import Filter from "../components/Ui/Filter";
import EmptyState from "../components/Ui/EmptyState";
import MonthYearSelector from "../components/Ui/MonthYearSelector";
import GastoCard from "../components/Compras/GastoCard";
import GastoDrawer from "../components/Compras/GastoDrawer";
import { useGastos } from "../hooks/useGastos";
import { useFilterState } from "../hooks/useFilterState";
import { fmtBRL } from "../utils/format";
import { mesAnoAnterior } from "../utils/Date.utils";
import { calcDelta } from "../utils/financeiro.utils";
import { filterByName } from "../utils/search";
import { MESES, ANOS } from "../constants";

const FILTROS = [
  { value: "todos",       label: "Todos"         },
  { value: "INGREDIENTE", label: "Ingredientes"  },
  { value: "FUNCIONARIO", label: "Funcionários"  },
  { value: "GENERICO",    label: "Outros Gastos" },
];

const GRUPOS_CFG = [
  { tipo: "INGREDIENTE", label: "Compras de Ingredientes",    cor: "#f59e0b" },
  { tipo: "FUNCIONARIO", label: "Pagamentos de Funcionários", cor: "#8b5cf6" },
  { tipo: "GENERICO",    label: "Outros Gastos",              cor: "#38bdf8" },
];

const ComprasPagamentos = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(ANOS[0]);
  const [drawerGasto, setDrawerGasto] = useState(null);

  const { filters, setFilter, dirty, reset: handleReset } = useFilterState({ busca: "", filtro: "todos" });
  const { busca, filtro } = filters;
  const setBusca  = setFilter("busca");
  const setFiltro = setFilter("filtro");

  const prev        = mesAnoAnterior(mes, ano);
  const mesPrevLabel = MESES.find((m) => m.value === prev.mes)?.label ?? "";
  const deltaHint   = `vs ${mesPrevLabel}/${prev.ano}`;

  // Hook de KPI — filtrado pelo mês/ano
  const kpi     = useGastos(useMemo(() => ({ mes, ano }),      [mes, ano]));
  const kpiPrev = useGastos(useMemo(() => ({ mes: prev.mes, ano: prev.ano }), [prev.mes, prev.ano]));

  // Hook de lista — sem filtro de data
  const lista   = useGastos(useMemo(() => ({}), []));

  const handleRefresh = useCallback(() => {
    kpi.refresh();
    kpiPrev.refresh();
    lista.refresh();
  }, [kpi.refresh, kpiPrev.refresh, lista.refresh]);

  const handleAlterado = useCallback(() => {
    kpi.refresh();
    lista.refresh();
  }, [kpi.refresh, lista.refresh]);

  const handleDeletado = useCallback(() => {
    setDrawerGasto(null);
    handleAlterado();
  }, [handleAlterado]);

  // Filtro de busca + tipo na lista
  const gastosFiltrados = useMemo(() => {
    const porNome = filterByName(lista.gastos, busca);
    return filtro === "todos" ? porNome : porNome.filter((g) => g.tipo === filtro);
  }, [lista.gastos, busca, filtro]);

  const gruposFiltrados = useMemo(() => {
    const tiposAtivos = filtro === "todos"
      ? GRUPOS_CFG.map((g) => g.tipo)
      : [filtro];
    return GRUPOS_CFG
      .filter((g) => tiposAtivos.includes(g.tipo))
      .map((g) => ({ ...g, items: gastosFiltrados.filter((x) => x.tipo === g.tipo) }))
      .filter((g) => g.items.length > 0);
  }, [gastosFiltrados, filtro]);

  const totalFiltrados = gastosFiltrados.length;
  const kpiLoading     = kpi.loading || kpiPrev.loading;

  const contagens = useMemo(() => ({
    ingrediente: kpi.gastos.filter((g) => g.tipo === "INGREDIENTE").length,
    funcionario: kpi.gastos.filter((g) => g.tipo === "FUNCIONARIO").length,
    generico:    kpi.gastos.filter((g) => g.tipo === "GENERICO").length,
    total:       kpi.gastos.length,
  }), [kpi.gastos]);

  return (
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Compras & Pagamentos"
        subtitle="Registre compras de ingredientes, pagamentos da equipe e outros gastos"
        onRefresh={handleRefresh}
        refreshing={lista.loading}
        rightSlot={
          <MonthYearSelector
            mes={mes} ano={ano}
            onMesChange={setMes} onAnoChange={setAno}
          />
        }
      />

      {/* KPI Cards — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              icon={ShoppingCart}
              label="Gastos com ingredientes"
              value={fmtBRL(kpi.totais.ingrediente)}
              deltaLabel={`${contagens.ingrediente} compra${contagens.ingrediente !== 1 ? "s" : ""} no mês`}
              delta={kpiPrev.totais.ingrediente === 0 ? null : calcDelta(kpi.totais.ingrediente, kpiPrev.totais.ingrediente)}
              deltaHint={kpiPrev.totais.ingrediente === 0 ? "Sem dados do mês anterior" : deltaHint}
              invertido
            />
            <KpiCard
              icon={Users}
              label="Gastos com funcionários"
              value={fmtBRL(kpi.totais.funcionario)}
              deltaLabel={`${contagens.funcionario} pagamento${contagens.funcionario !== 1 ? "s" : ""} no mês`}
              delta={kpiPrev.totais.funcionario === 0 ? null : calcDelta(kpi.totais.funcionario, kpiPrev.totais.funcionario)}
              deltaHint={kpiPrev.totais.funcionario === 0 ? "Sem dados do mês anterior" : deltaHint}
              invertido
            />
            <KpiCard
              icon={DollarSign}
              label="Outros gastos"
              value={fmtBRL(kpi.totais.generico)}
              deltaLabel={`${contagens.generico} lançamento${contagens.generico !== 1 ? "s" : ""} no mês`}
              delta={kpiPrev.totais.generico === 0 ? null : calcDelta(kpi.totais.generico, kpiPrev.totais.generico)}
              deltaHint={kpiPrev.totais.generico === 0 ? "Sem dados do mês anterior" : deltaHint}
              invertido
            />
            <KpiCard
              icon={TrendingDown}
              label="Total do mês"
              value={fmtBRL(kpi.totais.total)}
              deltaLabel={`${contagens.total} lançamento${contagens.total !== 1 ? "s" : ""} no mês`}
              delta={kpiPrev.totais.total === 0 ? null : calcDelta(kpi.totais.total, kpiPrev.totais.total)}
              deltaHint={kpiPrev.totais.total === 0 ? "Sem dados do mês anterior" : deltaHint}
              invertido
            />
          </>
        )}
      </div>

      {/* Lista de Gastos */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold shrink-0 ml-5">
            Nossos Gastos
          </h2>
          {!lista.loading && (
            <span className="text-slate-500 text-[10px] shrink-0">
              · {totalFiltrados} registro{totalFiltrados !== 1 ? "s" : ""}
            </span>
          )}
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <div className="mb-4">
          <Filter
            search={{ value: busca, onChange: setBusca, placeholder: "Buscar por nome..." }}
            tabs={[{ options: FILTROS, value: filtro, onChange: setFiltro }]}
            dirty={dirty}
            onReset={handleReset}
            actions={[
              { label: "Novo Gasto", icon: Plus, onClick: () => setDrawerGasto({ tipoInicial: "INGREDIENTE", gasto: null }) },
            ]}
          />
        </div>

        {lista.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
        ) : totalFiltrados === 0 ? (
          <EmptyState
            message="Nenhum lançamento encontrado."
            actionLabel={dirty ? "Limpar filtros" : undefined}
            onAction={dirty ? handleReset : undefined}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {gruposFiltrados.map(({ tipo, label, cor, items }) => (
              <div key={tipo}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0 ml-5">
                    <span style={{ color: cor }}> ● </span>
                    {label}
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    {items.length} registro{items.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {items.map((g) => (
                    <GastoCard
                      key={g.id}
                      gasto={g}
                      onClick={() => setDrawerGasto({ tipoInicial: g.tipo, gasto: g })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {drawerGasto && (
        <GastoDrawer
          gasto={drawerGasto.gasto}
          tipoInicial={drawerGasto.tipoInicial}
          mes={mes}
          ano={ano}
          createMode={drawerGasto.gasto === null}
          onClose={() => setDrawerGasto(null)}
          onCriado={() => { handleAlterado(); setDrawerGasto(null); }}
          onAtualizado={handleAlterado}
          onDeletado={handleDeletado}
        />
      )}
    </div>
  );
};

export default ComprasPagamentos;
