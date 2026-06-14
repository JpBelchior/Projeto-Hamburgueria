import { X } from "lucide-react";
import { ACCENT } from "../../utils/format";

/**
 * Drawer — componentes estruturais para painéis laterais deslizantes.
 *
 * Exports:
 *   default Drawer       — overlay + painel fixo à direita
 *   DrawerHeader         — cabeçalho com título, badge, ações e botão X (+ barra de cor)
 *   DrawerFooter         — rodapé com border-t para botões de ação
 *   DrawerSection        — rótulo de seção (texto pequeno uppercase)
 *   DrawerRow            — linha label / valor usada em blocos de detalhes
 */

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function Drawer({ onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {children}
      </div>
    </>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

/**
 * DrawerHeader
 *
 * Props:
 *   title        {ReactNode}  — título principal (string ou JSX para gradient text)
 *   badge        {ReactNode}  — badge opcional ao lado do título
 *   actions      {ReactNode}  — botões/links à direita, antes do X
 *   onClose      {function}   — fecha o drawer
 *   accentColor  {string}     — cor hex/css para a barra gradiente abaixo do header
 */
export function DrawerHeader({ title, badge, actions, onClose, accentColor }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 shrink-0">
        {/* Título + badge */}
        <div className="flex items-center gap-2 min-w-0">
          {typeof title === "string" ? (
            <h2 className="text-base font-bold text-white truncate">{title}</h2>
          ) : (
            title
          )}
          {badge}
        </div>

        {/* Ações + fechar */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {actions}
          <button
            onClick={onClose}
            className="ml-1 text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {accentColor && (
        <div
          className="h-0.5 shrink-0"
          style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }}
        />
      )}
    </>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

/**
 * DrawerFooter — rodapé com border-t.
 * Usa flex row + gap-2 por padrão; passe className para sobrescrever.
 */
export function DrawerFooter({ children, className = "flex items-center gap-2" }) {
  return (
    <div className={`px-5 py-4 border-t border-slate-700/50 shrink-0 ${className}`}>
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

/**
 * DrawerSection — rótulo de seção com estilo padrão uppercase tracking-widest.
 */
export function DrawerSection({ children }) {
  return (
    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
      {children}
    </p>
  );
}

// ── Gradient Title ────────────────────────────────────────────────────────────

/**
 * DrawerGradientTitle — título com gradiente âmbar padrão para modos criar/editar.
 */
export function DrawerGradientTitle({ children }) {
  return (
    <h2
      className="text-base font-bold bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
    >
      {children}
    </h2>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

/**
 * DrawerSkeleton — estado de carregamento padrão para drawers.
 * Exibe avatar + linhas + duas seções de grid 2 colunas.
 */
export function DrawerSkeleton() {
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
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-slate-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800 rounded" />)}
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

/**
 * DrawerRow — linha label / valor para blocos de informação.
 *
 * Props:
 *   label      {string}
 *   value      {ReactNode}
 *   highlight  {boolean}  — realça o valor com cor âmbar
 */
export function DrawerRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-amber-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
