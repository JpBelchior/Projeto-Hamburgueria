import ItemCard from "../Ui/ItemCard";
import { fmtBRL } from "../../utils/format";
import { MESES } from "../../constants";

const TIPO_CFG = {
  INGREDIENTE: {
    badgeLabel:  "Ingredientes",
    badgeCls:    "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    borderColor: "#f59e0b30",
    glowColor:   "#f59e0b08",
    countFn:     (g) => g.ingrediente?.ingredientes?.length ?? 0,
    countLabel:  (n) => `${n} ingrediente${n !== 1 ? "s" : ""}`,
  },
  FUNCIONARIO: {
    badgeLabel:  "Funcionários",
    badgeCls:    "bg-violet-500/10 border border-violet-500/30 text-violet-400",
    borderColor: "#8b5cf630",
    glowColor:   "#8b5cf608",
    countFn:     (g) => g.funcionario?.funcionarios?.length ?? 0,
    countLabel:  (n) => `${n} funcionário${n !== 1 ? "s" : ""}`,
  },
  GENERICO: {
    badgeLabel:  "Outros",
    badgeCls:    "bg-sky-500/10 border border-sky-500/30 text-sky-400",
    borderColor: "#38bdf830",
    glowColor:   "#38bdf808",
    countFn:     () => null,
    countLabel:  () => null,
  },
};

export default function GastoCard({ gasto, onClick }) {
  const cfg      = TIPO_CFG[gasto.tipo] ?? TIPO_CFG.GENERICO;
  const count    = cfg.countFn(gasto);
  const mesLabel = MESES.find((m) => m.value === gasto.mes)?.label ?? "";

  const badge = (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-md mb-1 ${cfg.badgeCls}`}>
      <span className="text-[9px] font-bold uppercase tracking-wider">{cfg.badgeLabel}</span>
    </div>
  );

  const footer = (
    <div className="flex items-end justify-between gap-2">
      <div>
        {count !== null && (
          <>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">{cfg.badgeLabel}:</p>
            <p className="text-sm font-bold tabular-nums text-white">{cfg.countLabel(count)}</p>
          </>
        )}
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Gasto:</p>
        <p className="text-sm font-bold tabular-nums text-white">{fmtBRL(gasto.valor)}</p>
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
