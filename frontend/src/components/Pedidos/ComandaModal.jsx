import Modal from "../Ui/Modal";
import StatusBadge from "../Ui/StatusBadge";
import { fmtBRL, PAGAMENTO_LABEL } from "../../utils/format";

export default function ComandaModal({ state, actions }) {
  const { comanda } = state;
  if (!comanda.aberto || !comanda.pedido) return null;

  const p = comanda.pedido;

  return (
    <Modal isOpen={comanda.aberto} onClose={actions.closeComanda} title="Comanda" size="sm">
      {/* Cabeçalho da comanda */}
      <div className="mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-bold text-sm tabular-nums">{p.numeroPedido}</span>
          <StatusBadge status={p.status} />
        </div>
        <p className="text-slate-400 text-xs">
          {p.nomeCliente || "Cliente não informado"}
        </p>
        {p.formaPagamento && (
          <p className="text-slate-500 text-xs mt-0.5">
            {PAGAMENTO_LABEL[p.formaPagamento] ?? p.formaPagamento}
          </p>
        )}
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-2 mb-4">
        {(p.itens ?? []).map((item, idx) => {
          const nome     = item.produto?.nome ?? item.combo?.nome ?? `Item ${idx + 1}`;
          const subtotal = item.quantidade * item.precoUnitario;
          return (
            <div key={item.id ?? idx} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs truncate">
                  {item.quantidade}× {nome}
                </p>
                {item.observacao && (
                  <p className="text-slate-500 text-[10px] truncate">{item.observacao}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-slate-400 text-[10px] tabular-nums">
                  {fmtBRL(item.precoUnitario)} un.
                </p>
                <p className="text-white text-xs font-semibold tabular-nums">
                  {fmtBRL(subtotal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-slate-400 text-xs font-medium">Total</span>
        <span className="text-white text-base font-bold tabular-nums">
          {fmtBRL(p.valorTotal)}
        </span>
      </div>
    </Modal>
  );
}
