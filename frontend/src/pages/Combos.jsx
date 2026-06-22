import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import Filter from "../components/Ui/Filter";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import EmptyState from "../components/Ui/EmptyState";
import ComboCard from "../components/Combos/ComboCard";
import PromocaoCard from "../components/Combos/PromocaoCard";
import ComboDrawer from "../components/Combos/ComboDrawer";
import PromocaoDrawer from "../components/Combos/PromocaoDrawer";
import { useCombos } from "../hooks/useCombos";
import { usePromocoes } from "../hooks/usePromocoes";
import { useFilterState } from "../hooks/useFilterState";
import { filterByName } from "../utils/search";
import { CAT_LABEL, CAT_COLOR } from "../utils/format";
import { PERIODOS } from "../constants";

const TABS = [
  { value: "todos",    label: "Todos"     },
  { value: "combo",    label: "Combos"    },
  { value: "promocao", label: "Promoções" },
];

const GRUPOS = [
  { tipo: "combo",    label: CAT_LABEL.COMBO,    cor: CAT_COLOR.COMBO    },
  { tipo: "promocao", label: CAT_LABEL.PROMOCAO,  cor: CAT_COLOR.PROMOCAO },
];

const Combos = () => {
  const { dados: combos,    loading: loadingCombos,    refetch: refetchCombos    } = useCombos();
  const { dados: promocoes, loading: loadingPromocoes, refetch: refetchPromocoes } = usePromocoes();

  const { filters, setFilter, dirty, reset } = useFilterState({ busca: "", filtro: "todos" });
  const { busca, filtro } = filters;
  const setBusca  = setFilter("busca");
  const setFiltro = setFilter("filtro");

  const [drawer,  setDrawer]  = useState(null);
  const [periodo, setPeriodo] = useState("30dias");

  const periodoLabel = PERIODOS.find((p) => p.value === periodo)?.label ?? periodo;

  const loading = loadingCombos || loadingPromocoes;

  const handleRefresh = useCallback(() => {
    refetchCombos();
    refetchPromocoes();
  }, [refetchCombos, refetchPromocoes]);

  const todosItens = useMemo(() => [
    ...combos.map((c) => ({ ...c, _tipo: "combo"    })),
    ...promocoes.map((p) => ({ ...p, _tipo: "promocao" })),
  ], [combos, promocoes]);

  const filtrados = useMemo(() => {
    const porNome = filterByName(todosItens, busca);
    return filtro === "todos" ? porNome : porNome.filter((i) => i._tipo === filtro);
  }, [todosItens, busca, filtro]);

  const gruposFiltrados = useMemo(() =>
    GRUPOS
      .filter((g) => filtro === "todos" || g.tipo === filtro)
      .map((g) => ({ ...g, items: filtrados.filter((i) => i._tipo === g.tipo) }))
      .filter((g) => g.items.length > 0),
  [filtrados, filtro]);

  const totalFiltrados = filtrados.length;

  const handleComboCriado = useCallback((novo) => {
    setDrawer(null);
    refetchCombos();
  }, [refetchCombos]);

  const handleComboAtualizado = useCallback((atualizado) => {
    refetchCombos();
  }, [refetchCombos]);

  const handleComboDeletado = useCallback(() => {
    setDrawer(null);
    refetchCombos();
  }, [refetchCombos]);

  const handlePromocaoCriada = useCallback(() => {
    setDrawer(null);
    refetchPromocoes();
  }, [refetchPromocoes]);

  const handlePromocaoAtualizada = useCallback(() => {
    refetchPromocoes();
  }, [refetchPromocoes]);

  const handlePromocaoDeletada = useCallback(() => {
    setDrawer(null);
    refetchPromocoes();
  }, [refetchPromocoes]);

  return (
    <>
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Combos & Promoções"
        subtitle="Crie combos de produtos e gerencie promoções do restaurante"
        onRefresh={handleRefresh}
        refreshing={loading}
      />

      <div>
        {/* Título + contagem */}
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold shrink-0 ml-5">
            Cardápio de Combos
          </h2>
          <span className="text-slate-500 text-[10px] shrink-0">
            · {combos.length} combo{combos.length !== 1 ? "s" : ""}
            {" "}· {promocoes.length} promoç{promocoes.length !== 1 ? "ões" : "ão"}
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Filter
            search={{ value: busca, onChange: setBusca, placeholder: "Buscar combos e promoções..." }}
            tabs={[
              { options: TABS,    value: filtro,  onChange: setFiltro  },
              { options: PERIODOS, value: periodo, onChange: setPeriodo },
            ]}
            dirty={dirty}
            onReset={reset}
            actions={[
              { label: "Novo Combo",    icon: Plus, onClick: () => setDrawer({ tipo: "combo",    item: null }) },
              { label: "Nova Promoção", icon: Plus, onClick: () => setDrawer({ tipo: "promocao", item: null }) },
            ]}
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
        ) : totalFiltrados === 0 ? (
          <EmptyState
            message="Nenhum combo ou promoção encontrado."
            actionLabel={dirty ? "Limpar filtros" : undefined}
            onAction={dirty ? reset : undefined}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {gruposFiltrados.map(({ tipo, label, cor, items }) => {
              const ativos   = items.filter((i) => i.ativo !== false).length;
              const inativos = items.length - ativos;
              return (
                <div key={tipo}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest shrink-0 ml-5">
                      <span style={{ color: cor }}> ● </span>{label}
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      {ativos} ativo{ativos !== 1 ? "s" : ""}
                      {inativos > 0 && ` · ${inativos} inativo${inativos !== 1 ? "s" : ""}`}
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item) =>
                      item._tipo === "combo" ? (
                        <ComboCard
                          key={`c-${item.id}`}
                          combo={item}
                          onClick={() => setDrawer({ tipo: "combo", item })}
                        />
                      ) : (
                        <PromocaoCard
                          key={`p-${item.id}`}
                          promocao={item}
                          onClick={() => setDrawer({ tipo: "promocao", item })}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {drawer?.tipo === "combo" && !drawer.item && (
      <ComboDrawer
        createMode
        onClose={() => setDrawer(null)}
        onComboCriado={handleComboCriado}
      />
    )}

    {drawer?.tipo === "combo" && drawer.item && (
      <ComboDrawer
        comboId={drawer.item.id}
        periodo={periodo}
        periodoLabel={periodoLabel}
        onClose={() => setDrawer(null)}
        onComboAtualizado={handleComboAtualizado}
        onComboDeletado={handleComboDeletado}
      />
    )}
    {drawer?.tipo === "promocao" && !drawer.item && (
      <PromocaoDrawer
        createMode
        onClose={() => setDrawer(null)}
        onPromocaoCriada={handlePromocaoCriada}
      />
    )}

    {drawer?.tipo === "promocao" && drawer.item && (
      <PromocaoDrawer
        promocaoId={drawer.item.id}
        periodo={periodo}
        periodoLabel={periodoLabel}
        onClose={() => setDrawer(null)}
        onPromocaoAtualizada={handlePromocaoAtualizada}
        onPromocaoDeletada={handlePromocaoDeletada}
      />
    )}
    </>
  );
};

export default Combos;
