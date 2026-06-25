import { Timer } from "lucide-react";
import ConfirmDialog from "../Ui/ConfirmDialog";
import {
  fmtBRL, fmtBRLShort,
  STATUS_LABEL, STATUS_COLOR, PAGAMENTO_LABEL,
  getSLAStatus, getSLAProgress, fmtElapsedP, elapsedSeconds,
} from "../../utils/format";
import { STATUS_COLS, STATUS_BLOQUEADO } from "../../constants";
import { useKanban } from "../../hooks/useKanban";

export default function PedidosKanban({ pedidos, tick, actions }) {
  const {
    grouped,
    dragId,    setDragId,
    dragOver,  setDragOver,
    pendingDrop, setPendingDrop,
    handleDrop,
    confirmarDrop,
  } = useKanban(pedidos, actions.updateStatus);

  return (
    <>
      <ConfirmDialog
        isOpen={!!pendingDrop}
        onClose={() => setPendingDrop(null)}
        onConfirm={confirmarDrop}
        title="Cancelar pedido"
        message={`Tem certeza que deseja cancelar o pedido ${pendingDrop?.numeroPedido}? O status será alterado para Cancelado e não poderá ser revertido.`}
        confirmLabel="Sim, cancelar"
      />
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {STATUS_COLS.map((status) => {
        const cor    = STATUS_COLOR[status];
        const itens  = grouped[status];
        const total  = itens.reduce((s, p) => s + p.valorTotal, 0);
        const isOver = dragOver === status;

        return (
          <div
            key={status}
            onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(status)}
            className={`bg-slate-900/40 border rounded-2xl p-3 flex flex-col min-h-[300px] transition-all duration-200 ${
              isOver ? "scale-[1.01]" : ""
            }`}
            style={{
              borderColor: isOver ? `${cor}80` : "rgba(30,41,59,0.7)",
            }}
          >
            {/* Cabeçalho da coluna */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: cor }} />
                <h3 className="text-white font-semibold text-xs">
                  {STATUS_LABEL[status]}
                </h3>
                <span className="text-slate-500 text-[10px] tabular-nums">
                  {itens.length}
                </span>
              </div>
              {status !== "CANCELADO" && (
                <span className="text-slate-500 text-[10px] tabular-nums">
                  {fmtBRLShort(total)}
                </span>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[calc(100vh-420px)]">
              {itens.map((p) => (
                <KanbanCard
                  key={p.id}
                  pedido={p}
                  tick={tick}
                  actions={actions}
                  onDragStart={() => setDragId(p.id)}
                  onDragEnd={() => { setDragId(null); setDragOver(null); }}
                  dragging={dragId === p.id}
                  bloqueado={STATUS_BLOQUEADO.includes(p.status)}
                />
              ))}
              {itens.length === 0 && (
                <div className="text-center text-slate-700 text-[11px] py-8 italic">
                  {isOver ? "Soltar aqui" : status === "CANCELADO" ? "—" : "vazio"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}

function KanbanCard({ pedido, tick, actions, onDragStart, onDragEnd, dragging, bloqueado }) {
  const showTimer = pedido.status === "ABERTO" || pedido.status === "EM_PREPARO";
  const sla       = getSLAStatus(pedido);
  const progresso = getSLAProgress(pedido);

  const nomeFunc = pedido.funcionario?.user?.name ?? "—";
  const qtdItens = pedido.itens?.reduce((s, i) => s + i.quantidade, 0) ?? 0;
  const primeiroItem = pedido.itens?.[0];
  const nomeItem = primeiroItem?.produto?.nome
    ?? primeiroItem?.combo?.nome
    ?? primeiroItem?.promocao?.nome
    ?? (primeiroItem ? "Item excluído" : "—");

  const tempoTotal =
    pedido.status === "FINALIZADO" && pedido.tempoFimPreparo && pedido.createdAt
      ? Math.floor(
          (new Date(pedido.tempoFimPreparo).getTime() - new Date(pedido.createdAt).getTime()) / 1000,
        )
      : null;

  const ref = pedido.status === "EM_PREPARO" && pedido.tempoInicioPreparo
    ? pedido.tempoInicioPreparo
    : pedido.createdAt;

  return (
    <div
      draggable={!bloqueado}
      onDragStart={bloqueado ? undefined : onDragStart}
      onDragEnd={bloqueado ? undefined : onDragEnd}
      onClick={() => actions.openEdit(pedido)}
      className={`bg-slate-900/70 border rounded-xl p-3 transition-all select-none ${
        bloqueado ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      } hover:border-slate-600 hover:scale-[1.01] ${dragging ? "opacity-40 scale-95" : ""}`}
      style={{
        borderColor: showTimer ? `${sla.color}40` : "rgba(51,65,85,0.5)",
      }}
    >
      {/* Linha topo: número + cronômetro/tempo */}
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-white font-semibold text-xs tabular-nums">
          {pedido.numeroPedido}
        </span>

        {showTimer && (
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: sla.color }}
            suppressHydrationWarning
          >
            {fmtElapsedP(elapsedSeconds(ref))}
          </span>
        )}

        {pedido.status === "FINALIZADO" && tempoTotal !== null && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tabular-nums text-emerald-400">
            <Timer size={10} />
            {fmtElapsedP(tempoTotal)}
          </span>
        )}
      </div>

      {/* Cliente */}
      <div className="text-slate-300 text-[11px] mb-1.5 truncate">
        {pedido.nomeCliente || "Cliente não informado"}
      </div>

      {/* Itens */}
      <div className="text-slate-500 text-[10px] mb-2 truncate">
        {qtdItens} {qtdItens === 1 ? "item" : "itens"} · {nomeItem}
        {(pedido.itens?.length ?? 0) > 1 ? ` +${pedido.itens.length - 1}` : ""}
      </div>

      {/* Barra de progresso SLA */}
      {showTimer && (
        <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progresso}%`, background: sla.color }}
          />
        </div>
      )}

      {/* Rodapé: funcionário + pagamento + valor */}
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <span className="text-slate-500 truncate">{nomeFunc}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {pedido.formaPagamento && (
            <span className="text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded text-[9px] font-medium">
              {PAGAMENTO_LABEL[pedido.formaPagamento] ?? pedido.formaPagamento}
            </span>
          )}
          <span className="text-white font-semibold tabular-nums">
            {fmtBRL(pedido.valorTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
