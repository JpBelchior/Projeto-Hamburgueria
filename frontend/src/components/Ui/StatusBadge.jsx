import { STATUS_CONFIG } from "../../constants";

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