import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { ACCENT, fmtBRL } from "../../utils/format";
import TabSelector from "../Ui/TabSelector";
import TooltipPopover from "../Ui/TooltipPopover";
import CardContainer from "../Ui/CardContainer";
import ErrorAlert from "../Ui/ErrorAlert";
import { useFinanceiro } from "../../hooks/useFinanceiro";
import { MESES, ANOS } from "../../constants";
import MonthYearSelector from "../Ui/MonthYearSelector";

export default function FinanceiroCard() {
  const [tipo, setTipo] = useState("mensal");
  const [mes,  setMes]  = useState(new Date().getMonth() + 1);
  const [ano,  setAno]  = useState(ANOS[0]);

  const { dados, loading, erro } = useFinanceiro(tipo, mes, ano);

  const custoIngredientes = dados?.custoIngredientes ?? 0;
  const custoFuncionarios = dados?.custoFuncionarios ?? 0;
  const custoTotal        = dados?.custoTotal        ?? 0;
  const receita           = dados?.receita           ?? 0;
  const margem            = dados?.margem            ?? 0;
  const gastoCadastrado   = dados?.gastoCadastrado   ?? false;

  const margemPct       = receita > 0 ? (margem / receita) * 100 : 0;
  const custoPctReceita = receita > 0 ? (custoTotal / receita) * 100 : 0;
  const ingPct          = custoTotal > 0 ? (custoIngredientes / custoTotal) * 100 : 50;
  const funcPct         = custoTotal > 0 ? (custoFuncionarios / custoTotal) * 100 : 50;

  const mesSelecionado = MESES.find((m) => m.value === mes)?.label ?? "";

  return (
    <CardContainer>
      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <TrendingUp size={14} style={{ color: ACCENT.text }} />
            Análise Financeira
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <TabSelector
              options={[
                { value: "mensal", label: "Mensal" },
                { value: "anual",  label: "Anual"  },
              ]}
              value={tipo}
              onChange={setTipo}
            />

            <MonthYearSelector
              mes={mes} ano={ano}
              onMesChange={setMes} onAnoChange={setAno}
              showMes={tipo === "mensal"}
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-800/50 rounded-xl" />
              <div className="h-20 bg-slate-800/50 rounded-xl" />
            </div>
            <div className="h-2.5 bg-slate-800/50 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-slate-800/50 rounded-xl" />
              <div className="h-16 bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        )}

        {!loading && erro && <ErrorAlert message={erro} />}

        {!loading && !erro && (
          <>
            {!gastoCadastrado && tipo === "mensal" && (
              <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-400/80 text-xs">
                Nenhum custo registrado para {mesSelecionado}/{ano}. Acesse <strong>Compras &amp; Pagamentos</strong> para lançar.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <MetricBox
                label="Custo total"
                value={fmtBRL(custoTotal)}
                sub={`${custoPctReceita.toFixed(1)}% da receita`}
              />
              <MetricBox
                label="Margem bruta"
                value={fmtBRL(margem)}
                sub={`${margemPct.toFixed(1)}% de margem`}
                highlight={margem >= 0 ? "#34d399" : "#ef4444"}
                hint="Faturamento − Custo Total"
              />
            </div>

            <div className="mb-1.5 flex items-baseline justify-between text-[10px]">
              <span className="text-slate-500 uppercase tracking-widest font-semibold">
                Composição do custo
              </span>
              <span className="text-slate-600 tabular-nums">
                {ingPct.toFixed(0)}% ingredientes · {funcPct.toFixed(0)}% funcionários
              </span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-800 mb-4">
              <div
                style={{ width: `${ingPct}%`, background: ACCENT.from }}
                title={`Ingredientes ${ingPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${funcPct}%`, background: "#94a3b8" }}
                title={`Funcionários ${funcPct.toFixed(1)}%`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustoRow
                label="Ingredientes"
                sub="Compras registradas no período"
                value={custoIngredientes}
                color={ACCENT.from}
              />
              <CustoRow
                label="Funcionários"
                sub="Folha registrada no período"
                value={custoFuncionarios}
                color="#94a3b8"
              />
            </div>

            <div className="mt-3 px-3 py-2.5 rounded-xl bg-slate-800/20 border border-slate-700/30 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Receita do período</span>
              <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(receita)}</span>
            </div>
          </>
        )}
      </div>
    </CardContainer>
  );
}

/* ─── Sub-componentes ──────────────────────────────────────────── */

function MetricBox({ label, value, sub, highlight, hint }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5">
        {label}
        {hint && <TooltipPopover text={hint} />}
      </p>
      <p
        className="text-2xl font-bold tabular-nums leading-tight"
        style={{ color: highlight ?? "white" }}
      >
        {value}
      </p>
      {sub && <p className="text-slate-500 text-[10px] mt-1 tabular-nums">{sub}</p>}
    </div>
  );
}

function CustoRow({ label, sub, value, color }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
      <span className="w-2 h-8 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-slate-300 text-xs font-medium truncate">{label}</span>
          <span className="text-white text-sm font-bold tabular-nums">{fmtBRL(value)}</span>
        </div>
        <p className="text-slate-500 text-[10px] truncate mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
