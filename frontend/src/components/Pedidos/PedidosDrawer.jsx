import { useState, useEffect } from "react";
import { X, Trash2, ChevronRight, Pencil, Ban, CheckCircle2, Clock, Search } from "lucide-react";
import StatusBadge from "../Ui/StatusBadge";
import Button from "../Ui/Button";
import FormField from "../Ui/FormField";
import ConfirmDialog from "../Ui/ConfirmDialog";
import { ACCENT, fmtBRL, CAT_LABEL, CAT_COLOR, STATUS_COLOR, STATUS_LABEL, PAGAMENTO_LABEL, fmtElapsedP } from "../../utils/format";
import { usePedidoForm }    from "../../hooks/usePedidoForm";
import { useItemSelector }  from "../../hooks/useItemSelector";
import { FORMAS_PAGAMENTO, PROXIMO_STATUS, PROXIMO_LABEL } from "../../constants";

const PAGAMENTOS = [{ value: "", label: "Não informado" }, ...FORMAS_PAGAMENTO];

// ── Sub-itens de combo ────────────────────────────────────────────────────────

function ComboProdutosLista({ produtos }) {
  if (!produtos?.length) return null;
  return (
    <div className="mt-1 pl-2 border-l-2 border-violet-500/30 flex flex-col gap-0.5">
      {produtos.map((cp, i) => (
        <span key={i} className="text-slate-500 text-[10px]">
          {cp.quantidade}x {cp.produto?.nome}
        </span>
      ))}
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

const STEPS = [
  { key: "ABERTO",     tsField: "createdAt"          },
  { key: "EM_PREPARO", tsField: "tempoInicioPreparo"  },
  { key: "FINALIZADO", tsField: "tempoFimPreparo"     },
];

function fmtTs(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Timeline({ pedido }) {
  const cancelado = pedido.status === "CANCELADO";

  const stepsCurrent = cancelado
    ? [
        { key: "ABERTO",     tsField: "createdAt"         },
        { key: "CANCELADO",  tsField: "updatedAt"          },
      ]
    : STEPS;

  const reachedIndex = cancelado
    ? 1
    : STEPS.findIndex((s) => s.key === pedido.status);

  return (
    <div className="flex flex-col gap-0">
      {stepsCurrent.map((step, idx) => {
        const reached = idx <= reachedIndex;
        const isCurrent = step.key === pedido.status;
        const cor = reached ? STATUS_COLOR[step.key] : "#334155";
        const ts  = fmtTs(pedido[step.tsField]);
        const isLast = idx === stepsCurrent.length - 1;

        let elapsed = null;
        if (isCurrent && (step.key === "ABERTO" || step.key === "EM_PREPARO")) {
          elapsed = fmtElapsedP(Math.floor((Date.now() - new Date(pedido[step.tsField]).getTime()) / 1000));
        }
        if (step.key === "FINALIZADO" && pedido.tempoFimPreparo && pedido.createdAt) {
          elapsed = fmtElapsedP(
            Math.floor((new Date(pedido.tempoFimPreparo).getTime() - new Date(pedido.createdAt).getTime()) / 1000),
          );
        }

        return (
          <div key={step.key} className="flex gap-3">
            {/* Coluna esquerda: dot + linha */}
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-0.5 transition-all duration-300"
                style={{
                  background:  reached ? cor : "transparent",
                  border:      `2px solid ${cor}`,
                  boxShadow:   isCurrent ? `0 0 8px ${cor}60` : "none",
                }}
              />
              {!isLast && (
                <div
                  className="w-px flex-1 my-1 min-h-[20px]"
                  style={{ background: reached && !isCurrent ? cor : "#1e293b" }}
                />
              )}
            </div>

            {/* Conteúdo */}
            <div className="pb-4 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: reached ? cor : "#475569" }}
                >
                  {STATUS_LABEL[step.key]}
                </span>
                {ts && (
                  <span className="text-slate-500 text-[10px] tabular-nums">{ts}</span>
                )}
              </div>
              {elapsed && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-slate-600" />
                  <span className="text-slate-500 text-[10px] tabular-nums">{elapsed}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Vista de detalhes ─────────────────────────────────────────────────────────

function DetalheView({ pedido }) {
  const nomeFunc = pedido.funcionario?.user?.name ?? "—";

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

      {/* Status badge + número */}
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-base tabular-nums">{pedido.numeroPedido}</span>
        <StatusBadge status={pedido.status} />
      </div>

      {/* Cliente + Pagamento */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex flex-col gap-2">
        <Row label="Cliente"    value={pedido.nomeCliente || "Não informado"} />
        <Row label="Pagamento"  value={pedido.formaPagamento ? (PAGAMENTO_LABEL[pedido.formaPagamento] ?? pedido.formaPagamento) : "Não informado"} />
        <Row label="Responsável" value={nomeFunc} highlight />
      </div>

      {/* Linha do tempo */}
      <div>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
          Linha do Tempo
        </p>
        <Timeline pedido={pedido} />
      </div>

      {/* Itens */}
      <div>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
          Itens
        </p>
        <div className="flex flex-col gap-1.5">
          {(pedido.itens ?? []).map((item, idx) => {
            const nome = item.produto?.nome ?? item.combo?.nome ?? `Item ${idx + 1}`;
            return (
              <div key={item.id ?? idx} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-800/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-xs">{item.quantidade}× {nome}</span>
                  <ComboProdutosLista produtos={item.combo?.produtos} />
                  {item.observacao && (
                    <p className="text-slate-500 text-[10px] truncate">{item.observacao}</p>
                  )}
                </div>
                <span className="text-slate-300 text-xs tabular-nums shrink-0">
                  {fmtBRL(item.quantidade * item.precoUnitario)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
        <span className="text-slate-400 text-sm">Total</span>
        <span className="text-white text-lg font-bold tabular-nums">{fmtBRL(pedido.valorTotal)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-amber-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Formulário de criação/edição ──────────────────────────────────────────────

// ── Seletor de produto ────────────────────────────────────────────────────────

function ItemSelector({ onSelect }) {
  const { aba, busca, setBusca, aberto, setAberto, filtrados, handleAba, clearSearch } = useItemSelector();

  const handleSelect = (item) => { onSelect(item, aba); clearSearch(); };

  return (
    <div className="relative">
      {/* Abas produto / combo */}
      <div className="flex gap-1 mb-2">
        {["produto", "combo"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleAba(tab)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              aba === tab
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            {tab === "produto" ? "Produto" : "Combo"}
          </button>
        ))}
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          placeholder={`Buscar ${aba === "produto" ? "produto" : "combo"} pelo nome…`}
          className="w-full pl-8 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
        />
      </div>

      {/* Dropdown */}
      {aberto && filtrados.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtrados.map((item) => {
            const preco = aba === "produto"
              ? item.precoVenda * (1 - (item.desconto ?? 0) / 100)
              : item.preco;
            const cor = aba === "produto" ? (CAT_COLOR[item.categoria] ?? "#94a3b8") : "#a78bfa";
            return (
              <button
                key={item.id}
                onMouseDown={() => handleSelect(item)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-700/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ color: cor, background: `${cor}20` }}
                  >
                    {aba === "produto" ? (CAT_LABEL[item.categoria] ?? item.categoria) : "Combo"}
                  </span>
                  <span className="text-white text-xs truncate">{item.nome}</span>
                </div>
                <span className="text-amber-400 text-xs font-semibold tabular-nums shrink-0">
                  {fmtBRL(preco)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {aberto && busca.trim() && filtrados.length === 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-500">
          Nenhum {aba === "produto" ? "produto" : "combo"} encontrado
        </div>
      )}
    </div>
  );
}

// ── Formulário de criação/edição ──────────────────────────────────────────────

function FormView({ drawer, actions }) {
  const { form, funcionarios, saving, erro, isEditar, setField, setItem, removeItem, addItem, valorTotal, handleSubmit } = usePedidoForm(drawer, actions);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Cliente */}
        <FormField label="Cliente">
          <input
            type="text" value={form.nomeCliente}
            onChange={(e) => setField("nomeCliente", e.target.value)}
            placeholder="Nome do cliente (opcional)"
            className={inputCls}
          />
        </FormField>

        {/* Pagamento */}
        <FormField label="Forma de Pagamento">
          <select value={form.formaPagamento} onChange={(e) => setField("formaPagamento", e.target.value)} className={inputCls}>
            {PAGAMENTOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </FormField>

        {/* Atendente */}
        <FormField label="Atendente Responsável">
          <select value={form.funcionarioId} onChange={(e) => setField("funcionarioId", e.target.value)} className={inputCls}>
            <option value="">— Selecionar atendente —</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.user.name}{f.cargo ? ` · ${f.cargo}` : ""}
              </option>
            ))}
          </select>
        </FormField>

        {/* Itens */}
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
            Itens
          </label>

          <ItemSelector onSelect={addItem} />

          {form.itens.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {form.itens.map((item, idx) => {
                const isCombo = item.tipo === "combo";
                const cor = isCombo ? "#a78bfa" : (CAT_COLOR[item.categoria] ?? "#94a3b8");
                return (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                    {/* Nome + categoria + remover */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: cor, background: `${cor}20` }}
                      >
                        {isCombo ? "Combo" : (CAT_LABEL[item.categoria] ?? "—")}
                      </span>
                      <span className="text-white text-xs flex-1 truncate">{item.nome}</span>
                      <button onClick={() => removeItem(idx)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Sub-itens do combo */}
                    {isCombo && <ComboProdutosLista produtos={item.comboProdutos} />}

                    {/* Quantidade + preço */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setItem(idx, "quantidade", Math.max(1, item.quantidade - 1))}
                          className="w-6 h-6 rounded-lg bg-slate-700/60 text-white text-sm flex items-center justify-center hover:bg-slate-600 transition-colors"
                        >−</button>
                        <span className="text-white text-sm font-semibold tabular-nums w-5 text-center">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => setItem(idx, "quantidade", item.quantidade + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-700/60 text-white text-sm flex items-center justify-center hover:bg-slate-600 transition-colors"
                        >+</button>
                      </div>
                      <span className="text-slate-500 text-xs">×</span>
                      <span className="text-slate-300 text-xs tabular-nums">{fmtBRL(item.precoUnitario)}</span>
                      <span className="ml-auto text-amber-400 text-xs font-semibold tabular-nums">
                        {fmtBRL(item.quantidade * item.precoUnitario)}
                      </span>
                    </div>

                    {/* Observação */}
                    <input
                      type="text"
                      value={item.observacao}
                      onChange={(e) => setItem(idx, "observacao", e.target.value)}
                      placeholder="Observação (opcional)"
                      className={inputSmCls + " w-full mt-2"}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {form.itens.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-4 italic">
              Busque um produto acima para adicionar ao pedido
            </p>
          )}
        </div>

        {erro && <p className="text-red-400 text-xs">{erro}</p>}
      </div>

      <div className="px-5 py-4 border-t border-slate-700/50 flex items-center justify-between gap-3">
        <span className="text-white font-bold tabular-nums text-sm">
          Total: {fmtBRL(valorTotal)}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={actions.closeDrawer}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando…" : isEditar ? "Salvar" : "Criar Pedido"}
          </Button>
        </div>
      </div>
    </>
  );
}

const inputCls    = "w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all";
const inputSmCls  = "bg-slate-700/50 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all";

// ── Componente principal ──────────────────────────────────────────────────────

export default function PedidosDrawer({ state, actions }) {
  const { drawer } = state;
  const [editMode,  setEditMode]  = useState(false);
  const [confirma,  setConfirma]  = useState(null); // null | "cancelar" | "excluir"

  useEffect(() => {
    if (drawer.aberto) setEditMode(drawer.modo === "criar");
  }, [drawer.aberto, drawer.modo]);

  if (!drawer.aberto) return null;

  const pedido       = drawer.dados;
  const showDetalhe  = drawer.modo === "editar" && !editMode;
  const cor          = pedido ? (STATUS_COLOR[pedido.status] ?? "#fbbf24") : "#fbbf24";
  const podeCancelar = pedido && pedido.status !== "CANCELADO" && pedido.status !== "FINALIZADO";
  const podeAvancar  = pedido && PROXIMO_STATUS[pedido.status];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={actions.closeDrawer} />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2">
            {showDetalhe ? (
              <h2 className="text-base font-bold text-white">Detalhes do Pedido</h2>
            ) : (
              <h2
                className="text-base font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
              >
                {drawer.modo === "criar" ? "Novo Pedido" : "Editar Pedido"}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showDetalhe && pedido.status !== "FINALIZADO" && pedido.status !== "CANCELADO" && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 border border-slate-700/50 hover:border-amber-500/30 transition-all"
              >
                <Pencil size={12} /> Editar
              </button>
            )}
            {editMode && drawer.modo === "editar" && (
              <button
                onClick={() => setEditMode(false)}
                className="text-xs text-slate-500 hover:text-white px-2 transition-colors"
              >
                Ver detalhes
              </button>
            )}
            <button onClick={actions.closeDrawer} className="ml-1 text-slate-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de status colorida */}
        {pedido && (
          <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(to right, ${cor}, transparent)` }} />
        )}

        {/* Conteúdo */}
        {showDetalhe ? (
          <>
            <DetalheView pedido={pedido} />

            {/* Footer de ações */}
            <div className="px-5 py-4 border-t border-slate-700/50 flex items-center gap-2 shrink-0">
              {/* Excluir — sempre disponível */}
              <button
                onClick={() => setConfirma("excluir")}
                title="Excluir pedido"
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <Trash2 size={15} />
              </button>

              <div className="flex gap-2 flex-1 justify-end">
                {podeCancelar && (
                  <Button variant="danger" size="sm" icon={Ban} onClick={() => setConfirma("cancelar")}>
                    Cancelar pedido
                  </Button>
                )}
                {podeAvancar && (
                  <Button
                    size="sm"
                    icon={pedido.status === "EM_PREPARO" ? CheckCircle2 : ChevronRight}
                    onClick={async () => { await actions.updateStatus(pedido.id, PROXIMO_STATUS[pedido.status]); actions.closeDrawer(); }}
                    className="flex-1"
                  >
                    {PROXIMO_LABEL[pedido.status]}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <FormView drawer={drawer} actions={actions} />
        )}
      </div>

      {/* Modais de confirmação — z-index acima do drawer (z-50) */}
      <ConfirmDialog
        isOpen={confirma === "cancelar"}
        onClose={() => setConfirma(null)}
        onConfirm={async () => { await actions.cancel(pedido.id); actions.closeDrawer(); }}
        title="Cancelar pedido"
        message={`Tem certeza que deseja cancelar o pedido ${pedido?.numeroPedido}? O status será alterado para Cancelado e não poderá ser revertido.`}
        confirmLabel="Sim, cancelar"
      />

      <ConfirmDialog
        isOpen={confirma === "excluir"}
        onClose={() => setConfirma(null)}
        onConfirm={() => actions.remove(pedido.id)}
        title="Excluir pedido"
        message={`Tem certeza que deseja excluir o pedido ${pedido?.numeroPedido}? Esta ação é permanente e não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
