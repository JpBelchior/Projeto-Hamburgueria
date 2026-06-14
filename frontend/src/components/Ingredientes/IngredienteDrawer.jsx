import { useState } from "react";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import Drawer, { DrawerHeader, DrawerFooter, DrawerSection, DrawerSkeleton, DrawerGradientTitle } from "../Ui/Drawer";
import Avatar from "../Ui/Avatar";
import Button from "../Ui/Button";
import ConfirmDialog from "../Ui/ConfirmDialog";
import IngredienteForm from "./IngredienteForm";
import { useIngredienteDrawer } from "../../hooks/useIngredienteDrawer";
import { ingredienteService } from "../../services/ingrediente.service";
import { ACCENT } from "../../utils/format";
import { UNIDADE_LABEL } from "../../constants";

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ ingrediente }) {
  const { nome, imagem, essencial, unidade, quantidadeAtual, estoqueMinimo, produtos } = ingrediente;
  const abaixoDoMinimo = estoqueMinimo != null && quantidadeAtual < estoqueMinimo;
  const unidadeLabel   = UNIDADE_LABEL[unidade] ?? unidade;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      <div className="flex items-start gap-4">
        <Avatar name={nome} src={imagem ?? undefined} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs mb-2">Medido em: {unidadeLabel}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {abaixoDoMinimo && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 uppercase tracking-wider">
                <AlertTriangle size={10} /> Abaixo do mínimo
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Estoque */}
      <div>
        <DrawerSection>Estoque</DrawerSection>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Atual</p>
            <p className={`text-xl font-bold tabular-nums ${abaixoDoMinimo ? "text-red-400" : "text-white"}`}>
              {quantidadeAtual}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">{unidadeLabel}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">Mínimo</p>
            <p className="text-white text-xl font-bold tabular-nums">
              {estoqueMinimo ?? "—"}
            </p>
            {estoqueMinimo != null && (
              <p className="text-slate-500 text-[10px] mt-0.5">{unidadeLabel}</p>
            )}
          </div>
        </div>
      </div>

      {/* Produtos que usam este ingrediente */}
      {produtos?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 ">
            <DrawerSection>Usado em</DrawerSection>
            <span className="text-slate-400 text-[10px] -mt-3">
              {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col">
            {produtos.map((pi, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <span className="text-white text-xs">{pi.produto.nome}</span>
                <span className="text-slate-400 text-xs tabular-nums">
                  {pi.quantidadeUsada} {unidadeLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function IngredienteDrawer({
  ingredienteId,
  createMode = false,
  onClose,
  onIngredienteCriado,
  onIngredienteAtualizado,
  onIngredienteDeletado,
}) {
  const [editMode,  setEditMode]  = useState(false);
  const [confirma,  setConfirma]  = useState(false);
  const [criando,   setCriando]   = useState(false);
  const [erroCriar, setErroCriar] = useState(null);

  const { ingrediente, loading, erro, salvando, erroSalvar, handleSalvar, handleDelete } =
    useIngredienteDrawer(ingredienteId, { onIngredienteAtualizado, onIngredienteDeletado });

  const showForm = createMode || editMode;

  const handleCriar = async (data) => {
    setCriando(true);
    setErroCriar(null);
    try {
      const novo = await ingredienteService.criar(data);
      onIngredienteCriado?.(novo);
    } catch (e) {
      setErroCriar(e?.response?.data?.message ?? e?.message ?? "Erro ao criar ingrediente.");
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
    ? <DrawerGradientTitle>Novo Ingrediente</DrawerGradientTitle>
    : editMode
    ? <DrawerGradientTitle>Editar Ingrediente</DrawerGradientTitle>
    : (ingrediente?.nome ?? "Carregando…");

  const headerBadge = !showForm && ingrediente ? (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
      ingrediente.essencial
        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
        : "bg-slate-700/40 border border-slate-600/40 text-slate-400"
    }`}>
      {ingrediente.essencial ? "Essencial" : "Não Essencial"}
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
  ) : ingrediente ? (
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
          accentColor={createMode ? ACCENT.from : ingrediente?.essencial ? "#f59e0b" : undefined}
        />

        {createMode ? (
          <div className="flex-1 overflow-y-auto p-5">
            {erroCriar && <p className="text-red-400 text-xs mb-3">{erroCriar}</p>}
            <IngredienteForm
              initialData={null}
              onSubmit={handleCriar}
              onCancel={onClose}
              loading={criando}
            />
          </div>
        ) : loading ? (
          <DrawerSkeleton />
        ) : erro ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <p className="text-red-400 text-sm text-center">{erro}</p>
          </div>
        ) : ingrediente ? (
          editMode ? (
            <div className="flex-1 overflow-y-auto p-5">
              <IngredienteForm
                initialData={ingrediente}
                onSubmit={handleSalvarEFechar}
                onCancel={() => setEditMode(false)}
                loading={salvando}
                erro={erroSalvar}
              />
            </div>
          ) : (
            <>
              <DetalheView ingrediente={ingrediente} />
              <DrawerFooter>
                <button
                  onClick={() => setConfirma(true)}
                  title="Excluir ingrediente"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </DrawerFooter>
            </>
          )
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={confirma}
        onClose={() => setConfirma(false)}
        onConfirm={handleDelete}
        title="Excluir ingrediente"
        message={`Tem certeza que deseja excluir "${ingrediente?.nome}"? O ingrediente será removido de todos os produtos onde é utilizado.`}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
