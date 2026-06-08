import { ArrowUp, ArrowDown } from "lucide-react";
import { ACCENT } from "../../utils/format";
import TooltipPopover from "./TooltipPopover";
import CardContainer from "./CardContainer";

/**
 * KpiCard — card de KPI reutilizável
 *
 * Props:
 *   icon        {LucideIcon}
 *   label       {string}
 *   value       {string}      já formatado
 *   delta       {number?}     variação % — omitir para ocultar badge
 *   deltaLabel  {string}      texto abaixo do valor (sub-legenda ou "vs ontem")
 *   hint        {string?}     tooltip "?" ao lado do label
 *   invertido   {bool?}       true quando queda é positiva (ex: tempo de preparo)
 *   size        {"default"|"compact"}  default = vertical (Dashboard); compact = horizontal (Pedidos/Produtos)
 */
export default function KpiCard({ icon: Icon, label, value, delta, deltaLabel, hint, invertido, size = "default" }) {
  const hasDelta   = delta !== null && delta !== undefined;
  const positive   = invertido ? delta < 0 : delta > 0;
  const deltaColor = positive ? "text-emerald-400" : "text-red-400";
  const deltaBg    = positive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20";
  const DeltaIcon  = (invertido ? !positive : positive) ? ArrowUp : ArrowDown;

  if (size === "compact") {
    return (
      <CardContainer className="hover:border-slate-600 transition-all">
        <div className="px-5 py-4 flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: ACCENT.tint, border: `1px solid ${ACCENT.border}` }}
          >
            <Icon size={16} style={{ color: ACCENT.text }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold truncate flex items-center gap-1.5">
              {label}
              {hint && <TooltipPopover text={hint} />}
            </p>
            <p className="text-white text-xl font-bold leading-tight tabular-nums truncate">
              {value}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-[11px] truncate">{deltaLabel}</p>
              {hasDelta && (
                <span className={`text-[10px] font-semibold shrink-0 ${deltaColor}`}>
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer className="relative hover:border-slate-600 transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: ACCENT.tint, border: `1px solid ${ACCENT.border}` }}
          >
            <Icon size={16} style={{ color: ACCENT.text }} />
          </div>
          {hasDelta && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${deltaBg}`}>
              <DeltaIcon size={10} className={deltaColor} />
              <span className={`text-[10px] font-bold ${deltaColor}`}>
                {Math.abs(delta).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1.5">
          {label}
          {hint && <TooltipPopover text={hint} />}
        </p>

        <p className="text-white text-2xl font-bold leading-tight tracking-tight tabular-nums">
          {value}
        </p>

        <p className="text-slate-500 text-[11px] mt-1">{deltaLabel}</p>
      </div>
    </CardContainer>
  );
}
