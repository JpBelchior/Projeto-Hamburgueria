import { useState, useCallback } from "react";
import { ShoppingCart, Users, Plus } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import KpiCard from "../components/Ui/KpiCard";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import Filter from "../components/Ui/Filter";
import EmptyState from "../components/Ui/EmptyState";
import MonthYearSelector from "../components/Ui/MonthYearSelector";
import GastoCard from "../components/Compras/GastoCard";
import GastoDrawer from "../components/Compras/GastoDrawer";
import { useGastoIngrediente } from "../hooks/useGastoIngrediente";
import { useGastoFuncionario } from "../hooks/useGastoFuncionario";
import { useFilterState } from "../hooks/useFilterState";
import { fmtBRL } from "../utils/format";
import { mesAnoAnterior } from "../utils/Date.utils";
import { calcDelta } from "../utils/financeiro.utils";
import { filterByName } from "../utils/search";
import { MESES, ANOS } from "../constants";

const FILTROS = [
  { value: "todos",        label: "Todos"        },
  { value: "ingrediente",  label: "Ingredientes" },
  { value: "funcionario",  label: "Funcionários" },
];

const ComprasPagamentos = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(ANOS[0]);
  const [drawerGasto, setDrawerGasto] = useState(null);

  const { filters, setFilter, dirty, reset: handleReset } = useFilterState({ busca: "", filtro: "todos" });
  const { busca, filtro } = filters;
  const setBusca  = setFilter("busca");
  const setFiltro = setFilter("filtro");

  const prev = mesAnoAnterior(mes, ano);
  const mesPrevLabel = MESES.find((m) => m.value === prev.mes)?.label ?? "";
  const deltaHint    = `vs ${mesPrevLabel}/${prev.ano}`;

  // KPI hooks — filtrados pelo mês/ano selecionado
  const ing      = useGastoIngrediente(mes,      ano,      undefined);
  const ingPrev  = useGastoIngrediente(prev.mes, prev.ano, undefined);
  const func     = useGastoFuncionario(mes,      ano,      undefined);
  const funcPrev = useGastoFuncionario(prev.mes, prev.ano, undefined);

  // Lista hooks — todos os gastos sem filtro de data
  const listIng  = useGastoIngrediente(undefined, undefined, undefined);
  const listFunc = useGastoFuncionario(undefined, undefined, undefined);

  const handleRefresh = useCallback(() => {
    ing.refresh();
    ingPrev.refresh();
    func.refresh();
    funcPrev.refresh();
    listIng.refresh();
    listFunc.refresh();
  }, [ing.refresh, ingPrev.refresh, func.refresh, funcPrev.refresh, listIng.refresh, listFunc.refresh]);

  const handleCriado = useCallback(() => {
    ing.refresh();
    func.refresh();
    listIng.refresh();
    listFunc.refresh();
  }, [ing.refresh, func.refresh, listIng.refresh, listFunc.refresh]);

  const handleDeletado = useCallback(() => {
    setDrawerGasto(null);
    handleCriado();
  }, [handleCriado]);

  const gastosIngFiltrados = filterByName(listIng.gastos, busca);
  const gastosFunFiltrados = filterByName(listFunc.gastos, busca);

  const GRUPOS = [
    { tipo: "ingrediente", label: "Compras de Ingredientes",    cor: "#f59e0b", items: gastosIngFiltrados },
    { tipo: "funcionario", label: "Pagamentos de Funcionários", cor: "#121155", items: gastosFunFiltrados },
  ];

  const gruposFiltrados = filtro === "todos"
    ? GRUPOS
    : GRUPOS.filter((g) => g.tipo === filtro);

  const totalFiltrados = gruposFiltrados.reduce((acc, g) => acc + g.items.length, 0);

  const listaLoading = listIng.loading || listFunc.loading;

  return (
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Compras & Pagamentos"
        subtitle="Registre compras de ingredientes e pagamentos da equipe"
        onRefresh={handleRefresh}
        refreshing={listaLoading}
        rightSlot={
          <MonthYearSelector
            mes={mes} ano={ano}
            onMesChange={setMes} onAnoChange={setAno}
          />
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ing.loading || ingPrev.loading ? (
          <KpiSkeleton />
        ) : (
          <KpiCard
            icon={ShoppingCart}
            label="Gastos com ingredientes"
            value={fmtBRL(ing.total)}
            delta={ingPrev.total === 0 ? null : calcDelta(ing.total, ingPrev.total)}
            deltaLabel={`${ing.gastos.length} compra${ing.gastos.length !== 1 ? "s" : ""} no mês`}
            deltaHint={ingPrev.total === 0 ? "Sem dados do mês anterior para comparação" : deltaHint}
            invertido
          />
        )}

        {func.loading || funcPrev.loading ? (
          <KpiSkeleton />
        ) : (
          <KpiCard
            icon={Users}
            label="Gastos com funcionários"
            value={fmtBRL(func.total)}
            delta={funcPrev.total === 0 ? null : calcDelta(func.total, funcPrev.total)}
            deltaLabel={`${func.gastos.length} pagamento${func.gastos.length !== 1 ? "s" : ""} no mês`}
            deltaHint={funcPrev.total === 0 ? "Sem dados do mês anterior para comparação" : deltaHint}
            invertido
          />
        )}
      </div>

      {/* Lista de Gastos */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold shrink-0 ml-5">
            Nossos Gastos
          </h2>
          {!listaLoading && (
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
              { label: "Novo Gasto",     icon: Plus, onClick: () => setDrawerGasto({ tipo: "ingrediente", gasto: null }) },
              { label: "Novo Pagamento", icon: Plus, onClick: () => setDrawerGasto({ tipo: "funcionario", gasto: null }) },
            ]}
          />
        </div>

        {listaLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
        ) : totalFiltrados === 0 ? (
          <EmptyState
            message="Nenhum lançamento encontrado."
            actionLabel={dirty ? "Limpar filtros" : undefined}
            onAction={dirty ? handleReset : undefined}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {gruposFiltrados.map(({ tipo, label, cor, items }) =>
              items.length === 0 ? null : (
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
                        tipo={tipo}
                        onClick={() => setDrawerGasto({ tipo, gasto: g })}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {drawerGasto && (
        <GastoDrawer
          gasto={drawerGasto.gasto}
          tipo={drawerGasto.tipo}
          mes={mes}
          ano={ano}
          createMode={drawerGasto.gasto === null}
          onClose={() => setDrawerGasto(null)}
          onCriado={() => { handleCriado(); setDrawerGasto(null); }}
          onAtualizado={handleCriado}
          onDeletado={handleDeletado}
        />
      )}
    </div>
  );
};

export default ComprasPagamentos;
