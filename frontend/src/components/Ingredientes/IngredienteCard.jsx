import { AlertTriangle } from "lucide-react";
import Avatar from "../Ui/Avatar";
import { UNIDADE_LABEL } from "../../constants";

export default function IngredienteCard({ ingrediente, onClick }) {
  const { nome, imagem, essencial, unidade, quantidadeAtual, estoqueMinimo } = ingrediente;

  const abaixoDoMinimo = estoqueMinimo != null && quantidadeAtual < estoqueMinimo;
  const unidadeLabel   = UNIDADE_LABEL[unidade] ?? unidade;

  const borderColor = abaixoDoMinimo ? "#781e1e" : essencial ? "#b8914f" : "#334155";
  const glowColor   = abaixoDoMinimo ? "#ef444412" : essencial ? "#f59e0b08" : "transparent";

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{
        border:    `1px solid ${borderColor}`,
        boxShadow: `0 0 12px ${glowColor}, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: avatar + badge + nome */}
        <div className="flex items-start gap-3">
          <Avatar name={nome} src={imagem ?? undefined} size="md" />
          <div className="min-w-0 flex-1">
            {essencial ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1 bg-amber-500/10 border border-amber-500/30">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  Essencial
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1 bg-slate-700/40 border border-slate-600/40">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Não Essencial
                </span>
              </div>
            )}
            <p className="text-white text-sm font-semibold leading-tight truncate">{nome}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{unidadeLabel}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

        {/* Estoque */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Estoque atual</p>
            <p className={`text-lg font-bold tabular-nums leading-tight ${abaixoDoMinimo ? "text-red-400" : "text-white"}`}>
              {quantidadeAtual} <span className="text-sm font-normal text-slate-400">{unidadeLabel}</span>
            </p>
          </div>

          {estoqueMinimo != null && (
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Mínimo</p>
              <div className="flex items-center gap-1 justify-end">
                {abaixoDoMinimo && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
                <p className={`text-sm font-semibold tabular-nums ${abaixoDoMinimo ? "text-red-400" : "text-slate-300"}`}>
                  {estoqueMinimo} <span className="text-xs font-normal text-slate-500">{unidadeLabel}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
