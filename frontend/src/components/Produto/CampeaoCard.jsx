import { Flame, UtensilsCrossed, Coffee, IceCream2, ArrowRight } from "lucide-react";
import Avatar from "../Ui/Avatar";
import { CAT_COLOR, CAT_LABEL, fmtBRL } from "../../utils/format";

const CAT_ICON = {
  PRINCIPAL:      Flame,
  ACOMPANHAMENTO: UtensilsCrossed,
  BEBIDA:         Coffee,
  SOBREMESA:      IceCream2,
};

export default function CampeaoCard({ categoria, produto, onVerProduto }) {
  const CatIcon = CAT_ICON[categoria] ?? Flame;
  const color   = CAT_COLOR[categoria] ?? "#fbbf24";
  const label   = CAT_LABEL[categoria] ?? categoria;

  return (
    <div
      className="bg-slate-900/60 rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
      style={{
        border:    `1px solid ${color}4d`,
        boxShadow: `inset 0 0 10px ${color}1a, 0 2px 5px rgba(0,0,0,0.3)`,
      }}
    >
      <div className=" ml-3 mt-3 mr-3 flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <CatIcon size={11} style={{ color }} />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color }}
            >
              #1 {label}
            </span>
          </div>

          {produto && (
            <button
              onClick={() => onVerProduto?.(produto.id)}
              className="flex items-center gap-0.5 text-slate-500 text-[11px] hover:text-slate-300 transition-colors"
            >
              ver <ArrowRight size={10} />
            </button>
          )}
        </div>

        {produto ? (
          <>
            {/* Produto */}
            <div className="flex items-center gap-3">
              <Avatar name={produto.nome} src={produto.imagem ?? undefined} size="md" />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {produto.nome}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{fmtBRL(produto.precoVenda)}</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent my-2" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3 ">
              <div>
                <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">
                  Vendidos:
                </p>
                <p className="text-white text-base font-bold tabular-nums">{produto.qtd}</p>
              </div>
              <div></div>
              <div>
                <p className="text-slate-500 text-[9px] uppercase tracking-widest font-semibold mb-1">
                  Receita:
                </p>
                <p className="text-base font-bold tabular-nums" style={{ color }}>
                  {fmtBRL(produto.receita)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              <CatIcon size={16} style={{ color: `${color}50` }} />
            </div>
            <p className="text-slate-600 text-xs text-center leading-relaxed">
              Nenhum item de <span className="text-slate-500 font-medium">{label}</span>
              <br />foi vendido neste período
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
