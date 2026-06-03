import React, { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { ACCENT, fmtBRL, fmtBRLShort, fmtNum } from "../../utils/format";
import TabSelector from "../Ui/TabSelector";
import { useSalesChart } from "../../hooks/useSalesChart";
import { ChartAreaIcon } from "lucide-react";

const METRIC_OPTIONS = [
  { value: "faturamento", label: "Faturamento" },
  { value: "pedidos",     label: "Pedidos"     },
];

const TITULO = {
  hoje:   "ao longo do dia",
  "7dias":  "últimos 7 dias",
  "30dias": "últimos 30 dias",
  anual:  "por mês",
};

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div
      className="bg-black/90 border rounded-xl px-3 py-2 shadow-xl backdrop-blur"
      style={{ borderColor: ACCENT.border }}
    >
      <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold text-sm tabular-nums">
        {metric === "faturamento" ? fmtBRL(v) : `${fmtNum(v)} pedidos`}
      </p>
    </div>
  );
}

export default function SalesChart({ period, refreshing }) {
  const [metric, setMetric] = useState("faturamento");
  const { dados, loading, erro } = useSalesChart(period);

  const data  = dados ?? [];
  const total = data.reduce((s, d) => s + d[metric], 0);
  const peak  = data.length > 0
    ? data.reduce((p, d) => (d[metric] > p[metric] ? d : p), data[0])
    : null;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
    <div className=" top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500  via-amber-400 to-transparent" />


      <div className="p-5 pb-2">
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm flex">
              <ChartAreaIcon size={16 } style={{ color: ACCENT.text }} className="mr-1 mt-1" />
              Vendas {TITULO[period] ?? ""}
            </h3>

            {!loading && !erro && peak && (
              <p className="text-slate-500 text-xs mt-0.5">
                Total:{" "}
                <span className="text-white font-semibold tabular-nums">
                  {metric === "faturamento" ? fmtBRL(total) : `${fmtNum(total)} pedidos`}
                </span>
                <span className="text-slate-700 mx-1.5">·</span>
                pico {peak.label}:{" "}
                <span className="font-semibold" style={{ color: ACCENT.text }}>
                  {metric === "faturamento" ? fmtBRLShort(peak[metric]) : peak[metric]}
                </span>
              </p>
            )}
          </div>

          <TabSelector
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
          />
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="px-5 pb-5 animate-pulse">
          <div className="w-48 h-3 bg-slate-800/50 rounded mb-6" />
          <div className="flex items-end gap-1 h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-800/50 rounded-t"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Erro */}
      {!loading && erro && (
        <div className="mx-5 mb-5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-xs">
          {erro}
        </div>
      )}

      {/* Gráfico */}
      {!loading && !erro && (
        <div
          className="px-2 pb-4"
          style={{ height: 260, opacity: refreshing ? 0.4 : 1, transition: "opacity .3s" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={ACCENT.from} stopOpacity={0.28} />
                  <stop offset="55%"  stopColor={ACCENT.to}   stopOpacity={0.10} />
                  <stop offset="100%" stopColor={ACCENT.to}   stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="salesLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={ACCENT.from} />
                  <stop offset="100%" stopColor={ACCENT.to}   />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 6"
                stroke="#334155"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  metric === "faturamento"
                    ? "R$" + (v / 1000).toFixed(0) + "k"
                    : v
                }
                width={42}
              />
              <Tooltip
                content={<CustomTooltip metric={metric} />}
                cursor={{ stroke: ACCENT.from, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="url(#salesLine)"
                strokeWidth={2.2}
                strokeOpacity={0.9}
                fill="url(#salesArea)"
                activeDot={{ r: 5, fill: ACCENT.to, stroke: "#000", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
