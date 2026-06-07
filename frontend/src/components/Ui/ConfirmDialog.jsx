import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  variant = "danger",
}) {
  const btnCls =
    variant === "danger"
      ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
      : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            Voltar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
