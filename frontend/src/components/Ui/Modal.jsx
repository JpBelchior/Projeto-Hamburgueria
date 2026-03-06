/**
 * Modal — wrapper genérico reutilizável
 *
 * Props:
 *   isOpen    {boolean}   — controla visibilidade
 *   onClose   {function}  — chamado ao fechar (botão X ou clique no backdrop)
 *   title     {string}    — título do modal
 *   children  {ReactNode} — conteúdo interno
 *   size      {string}    — "sm" | "md" | "lg" (padrão: "md")
 */

const SIZE_CONFIG = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative w-full ${SIZE_CONFIG[size] ?? SIZE_CONFIG.md}
          bg-slate-900 border border-amber-500/10
          rounded-2xl shadow-2xl shadow-black/50
          flex flex-col max-h-[90vh]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-white font-semibold text-base tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo com scroll interno */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;