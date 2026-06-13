import { useState } from "react";
import { LayoutGrid, TrendingUp, DollarSign, Flame, PackagePlus } from "lucide-react";
import HeaderBar from "../components/Ui/HeaderBar";
import KpiCard from "../components/Ui/KpiCard";
import CampeaoCard from "../components/Ui/CampeaoCard";
import ErrorAlert from "../components/Ui/ErrorAlert";
import Filter from "../components/Ui/Filter";
import ProdutoCard from "../components/Produto/ProdutoCard";
import ProdutoDrawer from "../components/Produto/ProdutoDrawer";
import { useProdutosMetricas } from "../hooks/useProdutosMetricas";
import { useProdutosTopCategoria } from "../hooks/useProdutosTopCategoria";
import { useProdutos } from "../hooks/useProdutos";
import { fmtBRL, CAT_LABEL, CAT_COLOR } from "../utils/format";
import { PERIODOS } from "../constants";

const CATEGORIAS = ["PRINCIPAL", "ACOMPANHAMENTO", "BEBIDA", "SOBREMESA"];

const CARDAPIO_TABS = [
  { value: "",               label: "Todos" },
  { value: "PRINCIPAL",      label: "Principais" },
  { value: "ACOMPANHAMENTO", label: "Acompanhamentos" },
  { value: "BEBIDA",         label: "Bebidas" },
  { value: "SOBREMESA",      label: "Sobremesas" },
];

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
  const [busca, setBusca] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("");
  const [drawerProdutoId, setDrawerProdutoId] = useState(null);

  const { dados, loading, erro }                   = useProdutosMetricas(periodo);
  const { dados: topCat, loading: topCatLoading, erro: topCatErro } = useProdutosTopCategoria(periodo);
  const { dados: produtos, setDados: setProdutos, loading: prodLoading, erro: prodErro } = useProdutos(true);

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

  const produtosFiltrados = produtos.filter(
    (p) =>
      (categoriaSel === "" || p.categoria === categoriaSel) &&
      (busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase())),
  );

  const grupos =
    categoriaSel === ""
      ? CATEGORIAS.map((cat) => ({
          cat,
          items: produtosFiltrados.filter((p) => p.categoria === cat),
        })).filter((g) => g.items.length > 0)
      : [{ cat: categoriaSel, items: produtosFiltrados }];

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
                  onVerProduto={setDrawerProdutoId}
                />
              ))
          }
        </div>
      </div>

      {/* Cardápio */}
      <div>
        {/* Título */}
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-[11px] uppercase tracking-widest font-semibold shrink-0 ml-5">
            Nosso Cardápio
          </h2>
          <span className="text-slate-500 text-[10px] shrink-0">
            · {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Filtros */}
        <div className="mb-4">
          <Filter
            search={{ value: busca, onChange: setBusca, placeholder: "Buscar produto..." }}
            tabs={[{ options: CARDAPIO_TABS, value: categoriaSel, onChange: setCategoriaSel }]}
            action={{ label: "Novo Produto", icon: PackagePlus }}
          />
        </div>

        {prodErro && !prodLoading && <ErrorAlert message={prodErro} />}

        {prodLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-slate-500 text-sm">Nenhum produto encontrado</p>
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="text-amber-400 text-xs hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grupos.map(({ cat, items }) => (
              <div key={cat}>
                {/* Separador de categoria */}
                <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest shrink-0 ml-5"
                      style={{ color: CAT_COLOR[cat] ?? "#fbbf24" }}
                    >
                      ● {CAT_LABEL[cat] ?? cat}
                    </span>
                    <span className="text-slate-600 text-[10px]">{items.length}</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {items.map((p) => (
                    <ProdutoCard key={p.id} produto={p} onClick={() => setDrawerProdutoId(p.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {drawerProdutoId && (
        <ProdutoDrawer
          produtoId={drawerProdutoId}
          periodo={periodo}
          periodoLabel={PERIODOS.find((p) => p.value === periodo)?.label ?? ""}
          onClose={() => setDrawerProdutoId(null)}
          onProdutoAtualizado={(atualizado) =>
            setProdutos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)))
          }
          onProdutoDeletado={(id) => {
            setProdutos((prev) => prev.filter((p) => p.id !== id));
            setDrawerProdutoId(null);
          }}
        />
      )}
    </div>
  );
}
