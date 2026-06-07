import React, { useState } from "react";
import { TrendingUp, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { ACCENT, fmtBRL } from "../../utils/format";
import TabSelector from "../Ui/TabSelector";
import Modal from "../Ui/Modal";
import TooltipPopover from "../Ui/TooltipPopover";
import CardContainer from "../Ui/CardContainer";
import ErrorAlert from "../Ui/ErrorAlert";
import { useFinanceiro } from "../../hooks/useFinanceiro";
import { useGastoIngrediente } from "../../hooks/useGastoIngrediente";
import { MESES } from "../../constants";

const anoAtual = new Date().getFullYear();
const ANOS = Array.from({ length: 5 }, (_, i) => anoAtual - i);

const selectClass =
  "bg-slate-800/70 border border-slate-700/50 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500/50";

export default function FinanceiroCard() {
  const [tipo, setTipo] = useState("mensal");
  const [mes,  setMes]  = useState(new Date().getMonth() + 1);
  const [ano,  setAno]  = useState(anoAtual);
  const [modalAberto, setModalAberto] = useState(false);

  const { dados, loading, erro, refetch } = useFinanceiro(tipo, mes, ano);

  const handleFecharModal = () => {
    setModalAberto(false);
    refetch();
  };

  const custoIngredientes = dados?.custoIngredientes ?? 0;
  const custoSalarios     = dados?.custoSalarios     ?? 0;
  const custoTotal        = dados?.custoTotal         ?? 0;
  const receita           = dados?.receita            ?? 0;
  const margem            = dados?.margem             ?? 0;
  const gastoCadastrado   = dados?.gastoCadastrado    ?? false;

  const margemPct       = receita > 0 ? (margem / receita) * 100 : 0;
  const custoPctReceita = receita > 0 ? (custoTotal / receita) * 100 : 0;
  const ingPct          = custoTotal > 0 ? (custoIngredientes / custoTotal) * 100 : 50;
  const salPct          = custoTotal > 0 ? (custoSalarios     / custoTotal) * 100 : 50;

  const mesSelecionado = MESES.find((m) => m.value === mes)?.label ?? "";

  return (
    <CardContainer>
      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <TrendingUp size={14} style={{ color: ACCENT.text }} />
            Análise Financeira
          </h3>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            <TabSelector
              options={[
                { value: "mensal", label: "Mensal" },
                { value: "anual",  label: "Anual"  },
              ]}
              value={tipo}
              onChange={setTipo}
            />

            {tipo === "mensal" && (
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className={selectClass}
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            )}

            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className={selectClass}
            >
              {ANOS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {tipo === "mensal" && (
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-slate-700/50 bg-slate-800/50 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-200"
              >
                <Plus size={12} />
                Lançar custos
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-800/50 rounded-xl" />
              <div className="h-20 bg-slate-800/50 rounded-xl" />
            </div>
            <div className="h-2.5 bg-slate-800/50 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-slate-800/50 rounded-xl" />
              <div className="h-16 bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        )}

        {!loading && erro && <ErrorAlert message={erro} />}

        {/* Dados */}
        {!loading && !erro && (
          <>
            {/* Banner sem dados */}
            {!gastoCadastrado && tipo === "mensal" && (
              <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-400/80 text-xs">
                Nenhuma compra registrada para {mesSelecionado}/{ano}. Clique em &ldquo;Lançar custos&rdquo; para adicionar.
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <MetricBox
                label="Custo total"
                value={fmtBRL(custoTotal)}
                sub={`${custoPctReceita.toFixed(1)}% da receita`}
              />
              <MetricBox
                label="Margem bruta"
                value={fmtBRL(margem)}
                sub={`${margemPct.toFixed(1)}% de margem`}
                highlight={margem >= 0 ? "#34d399" : "#ef4444"}
                hint="Faturamento − Custo Total"
              />
            </div>

            {/* Stacked bar */}
            <div className="mb-1.5 flex items-baseline justify-between text-[10px]">
              <span className="text-slate-500 uppercase tracking-widest font-semibold">
                Composição do custo
              </span>
              <span className="text-slate-600 tabular-nums">
                {ingPct.toFixed(0)}% ingredientes · {salPct.toFixed(0)}% salários
              </span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-800 mb-4">
              <div
                style={{ width: `${ingPct}%`, background: ACCENT.from }}
                title={`Ingredientes ${ingPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${salPct}%`, background: "#94a3b8" }}
                title={`Salários ${salPct.toFixed(1)}%`}
              />
            </div>

            {/* Detalhe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustoRow
                label="Ingredientes"
                sub="Compras registradas no período"
                value={custoIngredientes}
                color={ACCENT.from}
              />
              <CustoRow
                label="Salários"
                sub="Folha registrada no período"
                value={custoSalarios}
                color="#94a3b8"
              />
            </div>

            {/* Receita */}
            <div className="mt-3 px-3 py-2.5 rounded-xl bg-slate-800/20 border border-slate-700/30 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Receita do período</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(receita)}</span>
            </div>
          </>
        )}
      </div>

      {/* Modal de compras */}
      {tipo === "mensal" && (
        <ComprasModal
          isOpen={modalAberto}
          onClose={handleFecharModal}
          mes={mes}
          ano={ano}
          mesSelecionado={mesSelecionado}
          totalSalarios={custoSalarios}
        />
      )}
    </CardContainer>
  );
}

/* ─── Sub-componentes ──────────────────────────────────────────── */

function MetricBox({ label, value, sub, highlight, hint }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5">
        {label}
        {hint && <TooltipPopover text={hint} />}
      </p>
      <p
        className="text-2xl font-bold tabular-nums leading-tight"
        style={{ color: highlight ?? "white" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-slate-500 text-[10px] mt-1 tabular-nums">{sub}</p>
      )}
    </div>
  );
}

function CustoRow({ label, sub, value, color }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
      <span className="w-2 h-8 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-slate-300 text-xs font-medium truncate">{label}</span>
          <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(value)}</span>
        </div>
        <p className="text-slate-500 text-[10px] truncate mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Modal de lançamento de compras ──────────────────────────── */

function ComprasModal({ isOpen, onClose, mes, ano, mesSelecionado, totalSalarios }) {
  const { gastos, total, loading, saving, editandoId, setEditandoId, add, edit, remove } =
    useGastoIngrediente(mes, ano, null);

  const [novoValor, setNovoValor]       = useState("");
  const [novaDesc,  setNovaDesc]        = useState("");
  const [editValor, setEditValor]       = useState("");
  const [editDesc,  setEditDesc]        = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novoValor || Number(novoValor) <= 0) return;
    await add(novoValor, novaDesc || undefined);
    setNovoValor("");
    setNovaDesc("");
  };

  const iniciarEdicao = (gasto) => {
    setEditandoId(gasto.id);
    setEditValor(String(gasto.valor));
    setEditDesc(gasto.descricao ?? "");
  };

  const salvarEdicao = async (id) => {
    if (!editValor || Number(editValor) <= 0) return;
    await edit(id, editValor, editDesc || undefined);
  };

  const inputClass =
    "bg-slate-800/70 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 placeholder-slate-600 w-full";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compras — ${mesSelecionado}/${ano}`}
      size="md"
    >
      {/* Lista */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded-lg" />
          ))}
        </div>
      ) : gastos.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-4">
          Nenhuma compra registrada para este mês.
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {gastos.map((g) =>
            editandoId === g.id ? (
              /* Linha de edição */
              <div key={g.id} className="flex items-center gap-2 bg-slate-800/40 border border-amber-500/20 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Descrição"
                  className="flex-1 bg-transparent text-slate-300 text-xs focus:outline-none placeholder-slate-600"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  className="w-24 bg-slate-800 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none text-right"
                />
                <button
                  onClick={() => salvarEdicao(g.id)}
                  disabled={saving}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Linha normal */
              <div key={g.id} className="flex items-center gap-2 bg-slate-800/30 border border-slate-700/40 rounded-lg px-3 py-2">
                <span className="flex-1 text-slate-300 text-xs truncate">
                  {g.descricao || <span className="text-slate-600 italic">Sem descrição</span>}
                </span>
                <span className="text-white text-xs font-bold tabular-nums shrink-0">
                  {fmtBRL(g.valor)}
                </span>
                <button
                  onClick={() => iniciarEdicao(g)}
                  className="text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => remove(g.id)}
                  disabled={saving}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-700/40 pt-2 mt-1">
            <span className="text-slate-400 text-xs">Total compras</span>
            <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(total)}</span>
          </div>
        </div>
      )}

      {/* Formulário novo lançamento */}
      <form onSubmit={handleAdd} className="flex items-end gap-2 mt-2">
        <div className="flex-1">
          <label className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 block">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={novaDesc}
            onChange={(e) => setNovaDesc(e.target.value)}
            placeholder="Ex: Carne, Laticínios..."
            className={inputClass}
          />
        </div>
        <div className="w-28">
          <label className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 block">
            Valor (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            placeholder="0,00"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving || !novoValor}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 transition-all duration-200 shrink-0"
        >
          <Plus size={13} />
          Adicionar
        </button>
      </form>

      {/* Info salários */}
      {totalSalarios > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-800/30 border border-slate-700/30 px-3 py-2">
          <span className="text-slate-500 text-[10px]">Folha de pagamento (snapshot)</span>
          <span className="text-slate-300 text-xs font-medium tabular-nums">{fmtBRL(totalSalarios)}</span>
        </div>
      )}
    </Modal>
  );
}
