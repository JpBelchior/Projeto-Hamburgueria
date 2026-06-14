import Avatar from "../Ui/Avatar";
import { fmtBRL, CAT_LABEL, CAT_COLOR, calcMargem, margemStyle } from "../../utils/format";

export default function ProdutoCard({ produto, onClick }) {
  const color = CAT_COLOR[produto.categoria] ?? "#fbbf24";
  const label = CAT_LABEL[produto.categoria] ?? produto.categoria;
  const inativo = produto.ativo === false;

  const margem = calcMargem(produto);

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/60 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${inativo ? "opacity-50" : ""}`}
      style={{
        border:    `1px solid ${inativo ? "#475569" : `${color}30`}`,
        boxShadow: `0 0 12px ${color}08, 0 2px 6px rgba(0,0,0,0.25)`,
      }}
    >
      {inativo && (
        <div className="absolute top-2 right-2 z-10 bg-slate-700 text-slate-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-600">
          Inativo
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: avatar + badge + nome */}
        <div className="flex items-start gap-3">
          <Avatar name={produto.nome} src={produto.imagem ?? undefined} size="md" />
          <div className="min-w-0 flex-1">
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-1"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color }}
              >
                {label}
              </span>
            </div>
            <p className="text-white text-sm font-semibold leading-tight">
              {produto.nome}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {produto.descricao && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
            {produto.descricao}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

        {/* Preço + margem */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-white text-lg font-bold tabular-nums leading-tight">
              {fmtBRL(produto.precoVenda)}
            </p>
            {produto.precoProducao != null && (
              <p className="text-slate-500 text-[11px] mt-0.5">
                custo {fmtBRL(produto.precoProducao)}
              </p>
            )}
          </div>
          {margem !== null && (
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 ${margemStyle(margem)}`}
            >
              {margem}% margem
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
