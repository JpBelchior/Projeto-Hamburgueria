import { Clock } from "lucide-react";
import ItemCard from "../Ui/ItemCard";
import { fmtBRL, CAT_COLOR, CAT_LABEL } from "../../utils/format";

export default function PromocaoCard({ promocao, onClick }) {
  const color   = CAT_COLOR.PROMOCAO;
  const inativo = promocao.ativo === false;

  const totalCombos   = promocao.combos?.length   ?? 0;
  const totalProdutos = promocao.produtos?.length  ?? 0;

  const badge = (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
        {CAT_LABEL.PROMOCAO}
      </span>
    </div>
  );

  const subtitle = (
    <div className="flex items-center gap-2 flex-wrap">
      {totalCombos > 0 && (
        <span className="text-slate-500 text-[11px]">
          {totalCombos} combo{totalCombos !== 1 ? "s" : ""}
        </span>
      )}
      {totalProdutos > 0 && (
        <span className="text-slate-500 text-[11px]">
          {totalProdutos} produto{totalProdutos !== 1 ? "s" : ""}
        </span>
      )}
      {promocao.tempoPreparo && (
        <span className="flex items-center gap-0.5 text-slate-500 text-[11px]">
          <Clock size={10} />
          {promocao.tempoPreparo} min
        </span>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-end justify-between gap-2">
      <div>
        {promocao.desconto != null ? (
          <>
            <p className="text-slate-500 text-xs line-through tabular-nums">
              {fmtBRL(promocao.precoTotal)}
            </p>
            <p className="text-white text-lg font-bold tabular-nums leading-tight">
              {fmtBRL(promocao.precoReal)}
            </p>
          </>
        ) : (
          <p className="text-white text-lg font-bold tabular-nums leading-tight">
            {fmtBRL(promocao.precoTotal)}
          </p>
        )}
      </div>
      {promocao.desconto != null && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {promocao.desconto.toFixed(0)}% off
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
      name={promocao.nome}
      subtitle={subtitle}
      footer={footer}
    >
      {promocao.descricao && (
        <p className="text-slate-500 text-xs line-clamp-2">{promocao.descricao}</p>
      )}
    </ItemCard>
  );
}
