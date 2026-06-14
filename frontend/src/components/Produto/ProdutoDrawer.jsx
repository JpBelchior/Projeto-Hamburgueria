import { useState } from "react";
import { Clock, TrendingUp, Pencil, Trash2, Power } from "lucide-react";
import Drawer, { DrawerHeader, DrawerFooter, DrawerSection } from "../Ui/Drawer";
import Avatar from "../Ui/Avatar";
import Button from "../Ui/Button";
import ConfirmDialog from "../Ui/ConfirmDialog";
import { fmtBRL, CAT_LABEL, CAT_COLOR, ACCENT, calcLucro, calcMargem, margemStyle } from "../../utils/format";
import { useProdutoDrawer } from "../../hooks/useProdutoDrawer";
import { produtoService } from "../../services/produto.service";
import ProdutoForm from "./ProdutoForm";

const UNIDADE_LABEL = { KG: "kg", G: "g", LITRO: "L", ML: "ml", UNIDADE: "un" };

function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-3/4" />
          <div className="h-2 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-px bg-slate-800" />
      <div className="space-y-3">
        <div className="h-2.5 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-10 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-slate-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800 rounded" />)}
      </div>
    </div>
  );
}

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ produto, desempenho, periodoLabel }) {
  const lucro  = calcLucro(produto);
  const margem = calcMargem(produto);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      <div className="flex items-start gap-4">
        <Avatar name={produto.nome} src={produto.imagem ?? undefined} size="lg" />
        <div className="flex-1 min-w-0">
          {produto.descricao && (
            <p className="text-slate-400 text-sm leading-relaxed mb-2">{produto.descricao}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {produto.tempoPreparoEstimado && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                <span className="text-slate-500 text-xs">{produto.tempoPreparoEstimado} min</span>
              </div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
              produto.ativo
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                : "bg-slate-700/40 text-slate-500 border-slate-600/30"
            }`}>
              {produto.ativo ? "Ativo no cardápio" : "Inativo"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Precificação */}
      <div>
        <DrawerSection>Precificação</DrawerSection>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço de Custo</p>
            <p className="text-white text-base font-bold tabular-nums">
              {produto.precoProducao != null ? fmtBRL(produto.precoProducao) : "—"}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">soma da ficha técnica</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Preço de Venda</p>
            <p className="text-base font-bold tabular-nums" style={{ color: ACCENT.text }}>
              {fmtBRL(produto.precoVenda)}
            </p>
            <p className="text-slate-600 text-[10px] mt-0.5">valor de cardápio</p>
          </div>
        </div>

        {lucro != null && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-xs">Lucro por unidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm font-semibold tabular-nums">+{fmtBRL(lucro)}</span>
              {margem !== null && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${margemStyle(margem)}`}>
                  {margem}% margem
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ficha técnica */}
      {produto.ingredientes?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <DrawerSection>Ingredientes · Ficha Técnica</DrawerSection>
            <span className="text-slate-600 text-[10px] -mt-3">
              {produto.ingredientes.length} {produto.ingredientes.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="flex flex-col">
            {produto.ingredientes.map((pi, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <span className="text-white text-xs">{pi.ingrediente.nome}</span>
                <span className="text-slate-500 text-xs tabular-nums">
                  {pi.quantidadeUsada} {UNIDADE_LABEL[pi.ingrediente.unidade] ?? pi.ingrediente.unidade}
                </span>
              </div>
            ))}
          </div>

          {produto.precoProducao != null && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-700/50">
              <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Preço de Custo</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(produto.precoProducao)}</span>
            </div>
          )}
        </div>
      )}

      {/* Desempenho */}
      <div>
        <DrawerSection>Desempenho · {periodoLabel}</DrawerSection>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Unidades Vendidas</p>
            <p className="text-white text-xl font-bold tabular-nums">{desempenho?.qtdVendida ?? 0}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Receita Gerada</p>
            <p className="text-base font-bold tabular-nums" style={{ color: ACCENT.text }}>
              {fmtBRL(desempenho?.receita ?? 0)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ProdutoDrawer({
  produtoId,
  createMode = false,
  periodo,
  periodoLabel,
  onClose,
  onProdutoCriado,
  onProdutoAtualizado,
  onProdutoDeletado,
}) {
  const [editMode, setEditMode] = useState(false);
  const [confirma, setConfirma] = useState(false);
  const [criando,  setCriando]  = useState(false);
  const [erroCriar, setErroCriar] = useState(null);

  const { produto, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete } =
    useProdutoDrawer(produtoId, periodo, { onProdutoAtualizado, onProdutoDeletado });

  const showForm = createMode || editMode;

  const color = produto ? (CAT_COLOR[produto.categoria] ?? "#fbbf24") : "#fbbf24";
  const label = produto ? (CAT_LABEL[produto.categoria] ?? produto.categoria) : "";

  const gradientTitle = (text) => (
    <h2
      className="text-base font-bold bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
    >
      {text}
    </h2>
  );

  const handleCriar = async (data) => {
    setCriando(true);
    setErroCriar(null);
    try {
      const novo = await produtoService.criar(data);
      onProdutoCriado?.(novo);
    } catch (e) {
      setErroCriar(e?.response?.data?.message ?? e?.message ?? "Erro ao criar produto.");
    } finally {
      setCriando(false);
    }
  };

  const handleSalvarEFechar = async (data) => {
    try {
      await handleSalvar(data);
      setEditMode(false);
    } catch {
      // erro exposto via erroSalvar
    }
  };

  // ── Header ────────────────────────────────────────────────────────────────

  const headerTitle = createMode
    ? gradientTitle("Novo Produto")
    : editMode
    ? gradientTitle("Editar Produto")
    : (produto?.nome ?? "Carregando…");

  const headerBadge = !showForm && produto ? (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0"
      style={{ color, background: `${color}20`, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  ) : null;

  const headerActions = showForm ? (
    !createMode ? (
      <button
        onClick={() => setEditMode(false)}
        className="text-xs text-slate-500 hover:text-white px-2 transition-colors"
      >
        Ver detalhes
      </button>
    ) : null
  ) : produto ? (
    <button
      onClick={() => setEditMode(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 border border-slate-700/50 hover:border-amber-500/30 transition-all"
    >
      <Pencil size={12} /> Editar
    </button>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Drawer onClose={onClose}>
        <DrawerHeader
          title={headerTitle}
          badge={headerBadge}
          actions={headerActions}
          onClose={onClose}
          accentColor={createMode ? ACCENT.from : color}
        />

        {/* Create mode — form direto sem fetch */}
        {createMode ? (
          <div className="flex-1 overflow-y-auto p-5">
            {erroCriar && <p className="text-red-400 text-xs mb-3">{erroCriar}</p>}
            <ProdutoForm
              initialData={null}
              onSubmit={handleCriar}
              onCancel={onClose}
              loading={criando}
            />
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : erro ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <p className="text-red-400 text-sm text-center">{erro}</p>
          </div>
        ) : produto ? (
          editMode ? (
            <div className="flex-1 overflow-y-auto p-5">
              <ProdutoForm
                initialData={produto}
                onSubmit={handleSalvarEFechar}
                onCancel={() => setEditMode(false)}
                loading={salvando}
                erro={erroSalvar}
              />
            </div>
          ) : (
            <>
              <DetalheView produto={produto} desempenho={desempenho} periodoLabel={periodoLabel} />

              <DrawerFooter>
                <button
                  onClick={() => setConfirma(true)}
                  title="Excluir produto"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex gap-2 flex-1 justify-end">
                  <Button variant="ghost" size="sm" icon={Power} onClick={handleToggleAtivo}>
                    {produto.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={confirma}
        onClose={() => setConfirma(false)}
        onConfirm={handleDelete}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${produto?.nome}"? O produto será removido do cardápio. Pedidos passados que o incluem não serão afetados.`}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
