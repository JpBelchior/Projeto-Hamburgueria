import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { ACCENT, CAT_LABEL, CAT_COLOR, fmtNum } from "../../utils/format";
import { useCategoriaMix } from "../../hooks/useCategoriaMix";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="bg-black/90 border rounded-xl px-3 py-2 shadow-xl backdrop-blur"
      style={{ borderColor: d.color + "60" }}
    >
      <p className="text-white font-semibold text-xs mb-1">{d.name}</p>
      <p className="text-slate-300 text-[11px] tabular-nums">{fmtNum(d.value)} unidades</p>
      <p className="text-slate-500 text-[10px] tabular-nums">{d.pct.toFixed(1)}% do total</p>
    </div>
  );
}

export default function CategoriaMix({ period }) {
  const { dados, loading, erro } = useCategoriaMix(period);

  const data = useMemo(() => {
    const totalQtd = dados.reduce((s, d) => s + d.qtd, 0) || 1;
    return dados.map((d) => ({
      name:      CAT_LABEL[d.categoria] ?? d.categoria,
      value:     d.qtd,
      pct:       (d.qtd / totalQtd) * 100,
      color:     CAT_COLOR[d.categoria]  ?? ACCENT.from,
      categoria: d.categoria,
    }));
  }, [dados]);

  const lider = data[0];

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

      <div className="p-5">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <PieIcon size={14} style={{ color: ACCENT.text }} />
          Mix de categorias
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">% de itens vendidos por categoria</p>

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse mt-4 space-y-3">
            <div className="mx-auto w-36 h-36 rounded-full bg-slate-800/70" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-800/70 shrink-0" />
                <div className="h-2.5 flex-1 bg-slate-800/70 rounded" />
                <div className="h-2.5 w-10 bg-slate-800/70 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && erro && (
          <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-xs">
            {erro}
          </div>
        )}

        {/* Sem dados */}
        {!loading && !erro && data.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-8">
            Nenhum dado para este período.
          </p>
        )}

        {/* Gráfico */}
        {!loading && !erro && data.length > 0 && (
          <>
            <div className="relative mt-2" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="#0a0a0a"
                    strokeWidth={2}
                  >
                    {data.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centro do donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold">líder</p>
                <p className="text-white font-bold text-sm tabular-nums" style={{ color: lider.color }}>
                  {lider.pct.toFixed(0)}%
                </p>
                <p className="text-slate-400 text-[10px]">{lider.name}</p>
              </div>
            </div>

            {/* Legenda */}
            <ul className="space-y-1.5 mt-2">
              {data.map((d) => (
                <li key={d.categoria} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-300 flex-1 truncate">{d.name}</span>
                  <span className="text-white font-semibold tabular-nums">{d.pct.toFixed(1)}%</span>
                  <span className="text-slate-500 tabular-nums w-20 text-right">{fmtNum(d.value)} un.</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
