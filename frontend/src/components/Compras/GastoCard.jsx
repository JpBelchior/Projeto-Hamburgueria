import ItemCard from "../Ui/ItemCard";
import { fmtBRL } from "../../utils/format";
import { MESES } from "../../constants";

const TIPO = {
  ingrediente: {
    badgeLabel:  "Ingredientes",
    badgeCls:    "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    borderColor: "#fbbf2430",
    glowColor:   "#fbbf2408",
    countLabel:  (n) => `${n} ingrediente${n !== 1 ? "s" : ""}`,
  },
  funcionario: {
    badgeLabel:  "Funcionários",
    badgeCls:    "bg-slate-700/40 border border-slate-600/40 text-slate-400",
    borderColor: "#64748b30",
    glowColor:   "transparent",
    countLabel:  (n) => `${n} funcionário${n !== 1 ? "s" : ""}`,
  },
};

export default function GastoCard({ gasto, tipo, onClick }) {
  const cfg   = TIPO[tipo];
  const count = tipo === "ingrediente"
    ? (gasto.ingredientes?.length ?? 0)
    : (gasto.funcionarios?.length ?? 0);
  const mesLabel = MESES.find((m) => m.value === gasto.mes)?.label ?? "";

  const badge = (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-md mb-1 ${cfg.badgeCls}`}>
      <span className="text-[9px] font-bold uppercase tracking-wider">{cfg.badgeLabel}</span>
    </div>
  );


  const footer = (
    <div className="flex items-end justify-between gap-2">
      <div>
        <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">{cfg.badgeLabel}:</p>
        <p className=" text-sm font-bold tabular-nums text-white" >
          {cfg.countLabel(count)} 
        </p>
      </div>
      
        <div className="text-right">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Gasto:</p>
          <div className="flex items-center gap-1 justify-end">
            <p className=" text-sm font-bold tabular-nums text-white" >
             {fmtBRL(gasto.valor)}
            </p>
          </div>
        </div>
    </div>
  );

  return (
    <ItemCard
      borderColor={cfg.borderColor}
      glowColor={cfg.glowColor}
      badge={badge}
      name={gasto.nome || "Sem nome"}
      subtitle={<p className="text-slate-500 text-[11px]">{mesLabel} {gasto.ano}</p>}
      footer={footer}
      onClick={onClick}
    >
      {gasto.descricao && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{gasto.descricao}</p>
      )}
    </ItemCard>
  );
}
