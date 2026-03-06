/**
 * StatusBadge — tag de status reutilizável
 *
 * Props:
 *   status  {string} — valor do status (ver STATUS_CONFIG abaixo)
 *
 * Suporta:
 *   Funcionário/Produto/Combo → true/false, "ativo", "inativo", "disponivel", "indisponivel"
 *   Pedido                    → "ABERTO", "EM_PREPARO", "FINALIZADO", "CANCELADO"
 */

const STATUS_CONFIG = {
  // ── Booleano / genérico ───────────────────────────────
  true:          { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  false:         { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },

  // ── Funcionário / Produto / Combo ─────────────────────
  ativo:         { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  inativo:       { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
  disponivel:    { label: "Disponível",   style: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  indisponivel:  { label: "Indisponível", style: "bg-red-500/15 text-red-400 border-red-500/25" },

  // ── Pedido ────────────────────────────────────────────
  ABERTO:        { label: "Aberto",       style: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  EM_PREPARO:    { label: "Em preparo",   style: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  FINALIZADO:    { label: "Finalizado",   style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  CANCELADO:     { label: "Cancelado",    style: "bg-red-500/15 text-red-400 border-red-500/25" },
};

const StatusBadge = ({ status }) => {
  const key = typeof status === "boolean" ? String(status) : status;
  const config = STATUS_CONFIG[key];

  // Fallback para status desconhecido
  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-500/15 text-slate-400 border-slate-500/25">
        {String(status)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};

export default StatusBadge;