import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { fmtBRL, ACCENT } from "../../utils/format";
import KpiCard from "../Ui/KpiCard";
import CardContainer from "../Ui/CardContainer";

const MIX = [
  { key: "essencial",    label: "Essencial",    cor: "#fbbf24" },
  { key: "naoEssencial", label: "Não essencial", cor: "#64748b" },
];

export default function IngredientesKpis({ metricas }) {
  const { total, essenciais, abaixoDoMinimo, gastoMes, gastoAno } = metricas;
  const naoEssenciais = total - essenciais;

  const mixContagem = { essencial: essenciais, naoEssencial: naoEssenciais };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

      {/* 1 — Total de ingredientes */}
      <KpiCard
        size="compact"
        icon={Package}
        label="Total de ingredientes"
        value={String(total)}
        deltaLabel={`${essenciais} essenciais`}
      />

      {/* 2 — Gastos com ingredientes (mês + ano) */}
      <CardContainer className="hover:border-slate-600 transition-all">
        <div className="px-5 py-4 flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: ACCENT.tint, border: `1px solid ${ACCENT.border}` }}
          >
            <DollarSign size={16} style={{ color: ACCENT.text }} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold truncate mb-0.5">
              Gastos com ingredientes
            </p>
            <p className="text-white text-xl font-bold leading-tight tabular-nums">
              {fmtBRL(gastoMes.total)}
            </p>
            <p className="text-slate-400 text-[12px] font-medium tabular-nums leading-tight">
              {fmtBRL(gastoAno.total)}{" "}
              <span className="text-slate-500 font-normal">no ano</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {gastoMes.compras} compra{gastoMes.compras !== 1 ? "s" : ""} no mês
              {" · "}
              {gastoAno.compras} no ano
            </p>
          </div>
        </div>
      </CardContainer>

      {/* 3 — Essenciais abaixo do mínimo */}
      <KpiCard
        size="compact"
        icon={AlertTriangle}
        label="Essenciais abaixo do mínimo"
        value={String(abaixoDoMinimo)}
        deltaLabel={abaixoDoMinimo === 0 ? "estoque OK" : "requer atenção"}
      />

      {/* 4 — Mix essencial */}
      <CardContainer className="hover:border-slate-600 transition-all">
        <div className="px-5 py-4">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
            Mix Essencial
          </p>

          <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-0.5">
            {MIX.map(({ key, cor }) =>
              mixContagem[key] > 0 ? (
                <div
                  key={key}
                  className="rounded-full transition-all duration-500"
                  style={{ flex: mixContagem[key], background: cor }}
                />
              ) : null
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {MIX.map(({ key, label, cor }) => (
              <span key={key} className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cor }} />
                {label} {mixContagem[key]}
              </span>
            ))}
          </div>
        </div>
      </CardContainer>

    </div>
  );
}
