import { useState } from "react";
import { PackagePlus } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import ErrorAlert from "../components/Ui/ErrorAlert";
import EmptyState from "../components/Ui/EmptyState";
import Filter from "../components/Ui/Filter";
import IngredientesKpis from "../components/Ingredientes/IngredientesKpis";
import IngredienteCard from "../components/Ingredientes/IngredienteCard";
import IngredienteDrawer from "../components/Ingredientes/IngredienteDrawer";
import { useIngredientesMetricas } from "../hooks/useIngredientesMetricas";
import { useIngredientes } from "../hooks/useIngredientes";

const ESSENCIAL_TABS = [
  { value: "",     label: "Todos" },
  { value: "true", label: "Essenciais" },
  { value: "false", label: "Não Essenciais" },
];

const Ingredientes = () => {
  const [busca, setBusca] = useState("");
  const [essencialSel, setEssencialSel] = useState("");
  const [drawerIngredienteId, setDrawerIngredienteId] = useState(null);

  const { dados, loading, erro } = useIngredientesMetricas();
  const { dados: ingredientes, setDados: setIngredientes, loading: ingLoading, erro: ingErro } = useIngredientes();

  const ingredientesFiltrados = ingredientes.filter((ing) =>
    (essencialSel === "" || String(ing.essencial) === essencialSel) &&
    (busca === "" || ing.nome.toLowerCase().includes(busca.toLowerCase())),
  );

  const grupos =
    essencialSel !== ""
      ? [{ essencial: essencialSel === "true", items: ingredientesFiltrados }]
      : [
          { essencial: true,  items: ingredientesFiltrados.filter((i) => i.essencial) },
          { essencial: false, items: ingredientesFiltrados.filter((i) => !i.essencial) },
        ].filter((g) => g.items.length > 0);

  const dirty = busca !== "" || essencialSel !== "";
  const handleReset = () => { setBusca(""); setEssencialSel(""); };

  return (
    <>
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Ingredientes"
        subtitle="Gerencie o estoque de ingredientes e matérias-primas"
      />

      {erro && !loading && <ErrorAlert message={erro} />}

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} variant="compact" />
          ))}
        </div>
      ) : (
        dados && <IngredientesKpis metricas={dados} />
      )}

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold shrink-0 ml-5">
            Nossos Ingredientes
          </h2>
          <span className="text-slate-500 text-[10px] shrink-0">
            · {ingredientesFiltrados.length} ingrediente{ingredientesFiltrados.length !== 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <div className="mb-4">
          <Filter
            search={{ value: busca, onChange: setBusca, placeholder: "Buscar ingrediente..." }}
            tabs={[{ options: ESSENCIAL_TABS, value: essencialSel, onChange: setEssencialSel }]}
            onReset={handleReset}
            action={{ label: "Criar Ingrediente", icon: PackagePlus, onClick: () => setDrawerIngredienteId("new") }}
          />
        </div>

        {ingErro && !ingLoading && <ErrorAlert message={ingErro} />}

        {ingLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <KpiSkeleton key={i} variant="compact" />
            ))}
          </div>
        ) : ingredientesFiltrados.length === 0 ? (
          <EmptyState
            message="Nenhum ingrediente encontrado"
            actionLabel={dirty ? "Limpar filtros" : undefined}
            onAction={dirty ? handleReset : undefined}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {grupos.map(({ essencial, items }) => {
              const abaixo = items.filter((i) => i.estoqueMinimo != null && i.quantidadeAtual < i.estoqueMinimo).length;
              return (
                <div key={String(essencial)}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0 ml-5">
                      <span style={{ color: essencial ? "#f59e0b" : "#64748b" }}> ● </span>
                      {essencial ? "Essenciais" : "Não Essenciais"}
                    </span>
                    <span className="text-slate-600 text-[11px]">{items.length} ingrediente{items.length !== 1 ? "s" : ""}</span>
                    {abaixo > 0 && (
                      <span className="text-red-400 text-[11px]">· {abaixo} abaixo do mínimo</span>
                    )}
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((ing) => (
                      <IngredienteCard key={ing.id} ingrediente={ing} onClick={() => setDrawerIngredienteId(ing.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {drawerIngredienteId !== null && (
      <IngredienteDrawer
        ingredienteId={drawerIngredienteId === "new" ? null : drawerIngredienteId}
        createMode={drawerIngredienteId === "new"}
        onClose={() => setDrawerIngredienteId(null)}
        onIngredienteCriado={(novo) => {
          setIngredientes((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
          setDrawerIngredienteId(null);
        }}
        onIngredienteAtualizado={(atualizado) =>
          setIngredientes((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)))
        }
        onIngredienteDeletado={(id) => {
          setIngredientes((prev) => prev.filter((i) => i.id !== id));
          setDrawerIngredienteId(null);
        }}
      />
    )}
    </>
  );
};

export default Ingredientes;
