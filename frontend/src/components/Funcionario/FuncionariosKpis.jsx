import { Users, DollarSign, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import KpiCard from "../Ui/KpiCard";
import CardContainer from "../Ui/CardContainer";
import { fmtBRL, ACCENT } from "../../utils/format";
import { CARGO_LABEL, CARGO_COLOR } from "../../constants";

const CARGOS = [
  { key: "ATENDENTE",  label: CARGO_LABEL.ATENDENTE  },
  { key: "COZINHEIRO", label: CARGO_LABEL.COZINHEIRO },
  { key: "CAIXA",      label: CARGO_LABEL.CAIXA      },
];

export default function FuncionariosKpis({ metricas }) {
  const maxSalario = Math.max(...CARGOS.map((c) => metricas.porCargo[c.key]?.salarioMedio ?? 0), 1);

  const pieData = CARGOS
    .map((c) => ({ key: c.key, name: c.label, value: metricas.porCargo[c.key]?.count ?? 0, color: CARGO_COLOR[c.key] }))
    .filter((d) => d.value > 0);

  const pctGasto = metricas.gastoMensal > 0
    ? ((metricas.salarioTotal / metricas.gastoMensal) * 100).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

      {/* 1 — Total */}
      <KpiCard
        icon={Users}
        label="Funcionários"
        value={String(metricas.total)}
        deltaLabel={`${metricas.ativos} ativos · ${metricas.inativos} inativos`}
      />

      {/* 2 — Salário Médio com barras por cargo */}
      <CardContainer className="hover:border-slate-600 transition-all">
        <div className="px-5 py-4 flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: ACCENT.tint, border: `1px solid ${ACCENT.border}` }}
          >
            <TrendingUp size={16} style={{ color: ACCENT.text }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
              Salário Médio
            </p>
            <p className="text-white text-xl font-bold tabular-nums leading-tight mb-2">
              {fmtBRL(metricas.salarioMedio)}
            </p>
            <div className="flex flex-col gap-1.5">
              {CARGOS.map(({ key, label }) => {
                const val = metricas.porCargo[key]?.salarioMedio ?? 0;
                const pct = (val / maxSalario) * 100;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-500 text-[9px]">{label}</span>
                      <span className="text-slate-400 text-[9px] tabular-nums">{fmtBRL(val)}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: CARGO_COLOR[key] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContainer>

      {/* 3 — Folha Salarial */}
      <KpiCard
        icon={DollarSign}
        label="Folha Salarial"
        value={fmtBRL(metricas.salarioTotal)}
        hint="Folha salarial dos funcionários ativos"
        deltaLabel={pctGasto !== null ? `${pctGasto}% do gasto mensal` : "sem gastos no mês"}
      />

      {/* 4 — Distribuição por Cargo */}
      <CardContainer className="hover:border-slate-600 transition-all">
        <div className="px-5 py-4">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-3">
            Distribuição por Cargo
          </p>

          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div style={{ width: 72, height: 72, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={34}
                      paddingAngle={2}
                      stroke="#0a0a0a"
                      strokeWidth={2}
                    >
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-1.5">
                {pieData.map((d) => (
                  <span key={d.key} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name} · {d.value}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-xs">Sem funcionários cadastrados.</p>
          )}
        </div>
      </CardContainer>

    </div>
  );
}
