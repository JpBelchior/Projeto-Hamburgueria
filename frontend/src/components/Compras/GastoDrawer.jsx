import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Drawer, { DrawerHeader, DrawerFooter, DrawerSection, DrawerRow, DrawerGradientTitle } from "../Ui/Drawer";
import Button from "../Ui/Button";
import GastoForm from "./GastoForm";
import { gastoIngredienteService, gastoFuncionarioService } from "../../services/gasto.service";
import { ACCENT, fmtBRL } from "../../utils/format";
import { MESES, UNIDADE_LABEL } from "../../constants";

// ── Vista de detalhes ─────────────────────────────────────────────────────────

const CFG = {
  ingrediente: {
    badgeLabel:  "Ingredientes",
    badgeCls:    "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    sectionLabel: "Ingredientes vinculados",
    nomeItem:    (r) => r.ingrediente?.nome ?? "—",
    subItem:     (r) => r.quantidade != null
      ? `${r.quantidade} ${UNIDADE_LABEL[r.ingrediente?.unidade] ?? r.ingrediente?.unidade ?? ""}`
      : null,
  },
  funcionario: {
    badgeLabel:  "Funcionários",
    badgeCls:    "bg-slate-700/40 border border-slate-600/40 text-slate-400",
    sectionLabel: "Funcionários vinculados",
    nomeItem:    (r) => r.funcionario?.user?.name ?? "—",
    subItem:     () => null,
  },
};

function DetalheView({ gasto, tipo }) {
  const cfg      = CFG[tipo];
  const mesLabel = MESES.find((m) => m.value === gasto.mes)?.label ?? "";
  const itens    = tipo === "ingrediente"
    ? (gasto.ingredientes ?? [])
    : (gasto.funcionarios ?? []);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${cfg.badgeCls}`}>
          {cfg.badgeLabel}
        </span>
      </div>

      <div className="h-px bg-slate-800" />

      <div>
        <DrawerSection>Dados do Lançamento</DrawerSection>
        <div className="flex flex-col gap-3">
          <DrawerRow label="Valor" value={fmtBRL(gasto.valor)} highlight />
          <DrawerRow label="Período" value={`${mesLabel} / ${gasto.ano}`} />
          {gasto.descricao && (
            <DrawerRow label="Descrição" value={gasto.descricao} />
          )}
        </div>
      </div>

      {itens.length > 0 && (
        <>
          <div className="h-px bg-slate-800" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <DrawerSection>{cfg.sectionLabel}</DrawerSection>
              <span className="text-slate-400 text-[10px] -mt-3">
                {itens.length} {itens.length !== 1 ? "itens" : "item"}
              </span>
            </div>
            <div className="flex flex-col">
              {itens.map((r, idx) => {
                const sub = cfg.subItem(r);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0"
                  >
                    <span className="text-white text-xs">{cfg.nomeItem(r)}</span>
                    {sub && <span className="text-slate-400 text-xs tabular-nums">{sub}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Modal de exclusão customizado ─────────────────────────────────────────────

function DeleteModal({ gasto, tipo, onConfirm, onClose }) {
  const temIngredientes = tipo === "ingrediente" && (gasto?.ingredientes?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-white font-semibold text-sm mb-2">Excluir lançamento</h3>
        <p className="text-slate-400 text-xs mb-4">
          Tem certeza que deseja excluir{" "}
          <strong className="text-white">"{gasto?.nome}"</strong>?
        </p>

        {temIngredientes && (
          <p className="text-slate-400 text-xs mb-5">
            Deseja reverter a quantidade dos ingredientes no estoque atual?
          </p>
        )}

        <div className="flex flex-col gap-2">
          {temIngredientes ? (
            <>
              <Button size="sm" onClick={() => onConfirm(true)}>
                Excluir e reverter estoque
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onConfirm(false)}>
                Excluir sem reverter
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => onConfirm(false)}>
              Sim, excluir
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function GastoDrawer({
  gasto,
  tipo,
  mes,
  ano,
  createMode = false,
  onClose,
  onCriado,
  onAtualizado,
  onDeletado,
}) {
  const [editMode,      setEditMode]      = useState(false);
  const [confirmaDelete, setConfirmaDelete] = useState(false);
  const [salvando,      setSalvando]      = useState(false);
  const [erroSalvar,    setErroSalvar]    = useState(null);

  const service = tipo === "ingrediente" ? gastoIngredienteService : gastoFuncionarioService;

  const handleCriar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      await service.create({ ...data, mes, ano });
      onCriado?.();
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao criar lançamento.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      await service.update(gasto.id, data);
      setEditMode(false);
      onAtualizado?.();
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao salvar lançamento.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (reverterEstoque) => {
    setConfirmaDelete(false);
    await service.remove(gasto.id, reverterEstoque);
    onDeletado?.();
  };

  const showForm  = createMode || editMode;
  const tipoLabel = tipo === "ingrediente" ? "Gasto" : "Pagamento";

  // ── Header ────────────────────────────────────────────────────────────────

  const headerTitle = createMode
    ? <DrawerGradientTitle>Novo {tipoLabel}</DrawerGradientTitle>
    : editMode
    ? <DrawerGradientTitle>Editar {tipoLabel}</DrawerGradientTitle>
    : (gasto?.nome ?? "Carregando…");

  const headerActions = showForm ? (
    !createMode ? (
      <button
        onClick={() => { setEditMode(false); setErroSalvar(null); }}
        className="text-xs text-slate-500 hover:text-white px-2 transition-colors"
      >
        Ver detalhes
      </button>
    ) : null
  ) : gasto ? (
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
          actions={headerActions}
          onClose={onClose}
          accentColor={ACCENT.from}
        />

        {showForm ? (
          <div className="flex-1 overflow-y-auto p-5">
            {erroSalvar && <p className="text-red-400 text-xs mb-3">{erroSalvar}</p>}
            <GastoForm
              initialData={createMode ? null : gasto}
              tipo={tipo}
              onSubmit={createMode ? handleCriar : handleSalvar}
              onCancel={createMode ? onClose : () => { setEditMode(false); setErroSalvar(null); }}
              loading={salvando}
            />
          </div>
        ) : gasto ? (
          <>
            <DetalheView gasto={gasto} tipo={tipo} />
            <DrawerFooter>
              <button
                onClick={() => setConfirmaDelete(true)}
                title="Excluir lançamento"
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </DrawerFooter>
          </>
        ) : null}
      </Drawer>

      {confirmaDelete && (
        <DeleteModal
          gasto={gasto}
          tipo={tipo}
          onConfirm={handleDelete}
          onClose={() => setConfirmaDelete(false)}
        />
      )}
    </>
  );
}
