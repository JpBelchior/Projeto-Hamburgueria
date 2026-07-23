import React, { useState, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceDot,
} from "recharts";
import { ACCENT, fmtBRL, fmtBRLShort, fmtNum } from "../../utils/format";
import TabSelector from "../Ui/TabSelector";
import { usePeriodFetch } from "../../hooks/usePeriodFetch";
import { dashboardService } from "../../services/dashboard.service";
import { ChartAreaIcon, ArrowUp, ArrowDown, Minus } from "lucide-react";
import CardContainer from "../Ui/CardContainer";
import ErrorAlert from "../Ui/ErrorAlert";

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

function CustomCursor({ points, height }) {
  if (!points?.length) return null;
  const { x, y } = points[0];
  return (
    <g>
      <rect x={x - 14} y={y} width={28} height={height} fill={ACCENT.from} fillOpacity={0.06} />
      <line x1={x} y1={y} x2={x} y2={y + height} stroke={ACCENT.from} strokeWidth={1} strokeDasharray="3 3" />
    </g>
  );
}

function TrendBadge({ variacao }) {
  if (variacao == null) return null;
  const isNeutral = variacao === 0;
  const positive  = !isNeutral && variacao > 0;
  const color = isNeutral ? "text-slate-400 bg-slate-500/10 border-slate-500/20"
    : positive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  const Icon = isNeutral ? Minus : positive ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${color}`}>
      <Icon size={10} />
      {isNeutral ? "—" : `${Math.abs(variacao).toFixed(1)}%`}
    </span>
  );
}

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

export default function SalesChart({ period, refreshing, variacaoFaturamento, variacaoPedidos }) {
  const [metric, setMetric] = useState("faturamento");
  const fn = useCallback(() => dashboardService.getVendas(period), [period]);
  const { dados, loading, erro } = usePeriodFetch(fn, "Não foi possível carregar os dados de vendas.");

  const data  = dados ?? [];
  const total = data.reduce((s, d) => s + d[metric], 0);
  const peak  = data.length > 0
    ? data.reduce((p, d) => (d[metric] > p[metric] ? d : p), data[0])
    : null;
  const variacao = metric === "faturamento" ? variacaoFaturamento : variacaoPedidos;

  return (
    <CardContainer>


      <div className="p-5 pb-2">
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm flex">
              <ChartAreaIcon size={16 } style={{ color: ACCENT.text }} className="mr-1 mt-1" />
              Vendas {TITULO[period] ?? ""}
            </h3>

            {!loading && !erro && peak && (
              <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5 flex-wrap">
                Total:{" "}
                <span className="text-white font-semibold tabular-nums">
                  {metric === "faturamento" ? fmtBRL(total) : `${fmtNum(total)} pedidos`}
                </span>
                <span className="text-slate-700 mx-0.5">·</span>
                pico {peak.label}:{" "}
                <span className="font-semibold" style={{ color: ACCENT.text }}>
                  {metric === "faturamento" ? fmtBRLShort(peak[metric]) : peak[metric]}
                </span>
                <TrendBadge variacao={variacao} />
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

      {!loading && erro && <ErrorAlert message={erro} className="mx-5 mb-5" />}

      {/* Gráfico */}
      {!loading && !erro && (
        <div
          className="px-2 pb-4"
          style={{ height: 260, opacity: refreshing ? 0.4 : 1, transition: "opacity .3s" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 4 }} accessibilityLayer>
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
                domain={[0, (max) => Math.ceil(max * 1.15)]}
              />
              <Tooltip
                content={<CustomTooltip metric={metric} />}
                cursor={<CustomCursor />}
                position={{ y: 4 }}
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
              {peak && (
                <ReferenceDot
                  x={peak.label}
                  y={peak[metric]}
                  r={4}
                  fill={ACCENT.to}
                  stroke="#000"
                  strokeWidth={2}
                  isFront
                  ifOverflow="extendDomain"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContainer>
  );
}
