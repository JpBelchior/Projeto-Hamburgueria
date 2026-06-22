import { Clock } from "lucide-react";
import ItemCard from "../Ui/ItemCard";
import { fmtBRL, CAT_COLOR, CAT_LABEL, calcComboDesconto } from "../../utils/format";

export default function ComboCard({ combo, onClick }) {
  const color    = CAT_COLOR.COMBO;
  const inativo  = combo.ativo === false;
  const desconto = calcComboDesconto(combo);

  const badge = (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
        {CAT_LABEL.COMBO}
      </span>
    </div>
  );

  const subtitle = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-[11px]">
        {combo.produtos?.length ?? 0} produto{(combo.produtos?.length ?? 0) !== 1 ? "s" : ""}
      </span>
      {combo.tempoPreparo && (
        <span className="flex items-center gap-0.5 text-slate-500 text-[11px]">
          <Clock size={10} />
          {combo.tempoPreparo} min
        </span>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-end justify-between gap-2">
      <p className="text-white text-lg font-bold tabular-nums leading-tight">
        {fmtBRL(combo.preco)}
      </p>
      {desconto != null && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {desconto.toFixed(0)}% off
        </span>
      )}
    </div>
  );

  return (
    <ItemCard
      onClick={onClick}
      borderColor={inativo ? "#475569" : `${color}30`}
      glowColor={inativo ? "transparent" : `${color}08`}
      inactive={inativo}
      badge={badge}
      name={combo.nome}
      subtitle={subtitle}
      footer={footer}
    >
      {combo.descricao && (
        <p className="text-slate-500 text-xs line-clamp-2">{combo.descricao}</p>
      )}
    </ItemCard>
  );
}
