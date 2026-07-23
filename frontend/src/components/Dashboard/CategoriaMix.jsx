import React, { useMemo, useCallback, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { ACCENT, CAT_LABEL, CAT_COLOR, fmtNum } from "../../utils/format";
import { usePeriodFetch } from "../../hooks/usePeriodFetch";
import { dashboardService } from "../../services/dashboard.service";
import CardContainer from "../Ui/CardContainer";
import ErrorAlert from "../Ui/ErrorAlert";

function renderActiveShape({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) {
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export default function CategoriaMix({ period }) {
  const fn = useCallback(() => dashboardService.getCategoriaMix(period), [period]);
  const { dados, loading, erro } = usePeriodFetch(fn, "Não foi possível carregar o mix de categorias.");
  const [activeIndex, setActiveIndex] = useState(-1);

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

  const lider    = data[0];
  const hovered  = activeIndex >= 0 ? data[activeIndex] : null;
  const centro   = hovered ?? lider;

  return (
    <CardContainer>
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
        {!loading && erro && <ErrorAlert message={erro} className="mt-3" />}

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
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(-1)}
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.color}
                        style={{
                          fillOpacity: activeIndex === -1 || activeIndex === i ? 1 : 0.35,
                          transition:  "fill-opacity .2s ease",
                          cursor:      "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro do donut — mostra o total ou, ao passar o mouse, a categoria sob o cursor */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold">
                  {hovered ? "selecionado" : "líder"}
                </p>
                <p className="text-white font-bold text-sm tabular-nums" style={{ color: centro.color }}>
                  {centro.pct.toFixed(0)}%
                </p>
                <p className="text-slate-400 text-[10px]">{centro.name}</p>
                {hovered && (
                  <p className="text-[9px] tabular-nums mt-0.5 font-medium" style={{ color: centro.color }}>
                    {fmtNum(hovered.value)} un.
                  </p>
                )}
              </div>
            </div>

            {/* Legenda */}
            <ul className="space-y-1.5 mt-2">
              {data.map((d, i) => (
                <li
                  key={d.categoria}
                  className="flex items-center gap-2 text-[11px] transition-opacity"
                  style={{ opacity: activeIndex === -1 || activeIndex === i ? 1 : 0.4 }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
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
    </CardContainer>
  );
}
