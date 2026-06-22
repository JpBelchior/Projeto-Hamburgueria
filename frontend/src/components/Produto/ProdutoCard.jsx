import { Clock } from "lucide-react";
import ItemCard from "../Ui/ItemCard";
import { fmtBRL, CAT_LABEL, CAT_COLOR, calcMargem, margemStyle } from "../../utils/format";

export default function ProdutoCard({ produto, onClick }) {
  const color   = CAT_COLOR[produto.categoria] ?? "#fbbf24";
  const label   = CAT_LABEL[produto.categoria] ?? produto.categoria;
  const inativo = produto.ativo === false;
  const margem  = calcMargem(produto);

  const badge = (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
    </div>
  );

  const nomeComTempo = (
    <span className="flex items-center gap-1.5 min-w-0">
      <span className="truncate">{produto.nome}</span>
      {produto.tempoPreparoEstimado && (
        <span className="flex mt-1 items-center gap-0.5 text-slate-500 text-[10px] font-normal shrink-0">
          <Clock size={9} />
          {produto.tempoPreparoEstimado} min
        </span>
      )}
    </span>
  );

  const footer = (
    <div className="flex items-end justify-between gap-2">
      <div>
        <p className="text-white text-lg font-bold tabular-nums leading-tight">
          {fmtBRL(produto.precoVenda)}
        </p>
        {produto.precoProducao != null && (
          <p className="text-slate-500 text-[11px] mt-0.5">custo {fmtBRL(produto.precoProducao)}</p>
        )}
      </div>
      {margem !== null && (
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 ${margemStyle(margem)}`}>
          {margem}% margem
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
      avatar={{ name: produto.nome, src: produto.imagem ?? undefined }}
      badge={badge}
      name={nomeComTempo}
      footer={footer}
    >
      {produto.descricao && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
          {produto.descricao}
        </p>
      )}
    </ItemCard>
  );
}
