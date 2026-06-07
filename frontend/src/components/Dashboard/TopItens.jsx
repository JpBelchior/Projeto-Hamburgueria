import React, { useState, useMemo, useCallback } from "react";
import { Flame } from "lucide-react";
import {
  ACCENT, CAT_LABEL, CAT_COLOR, withAlpha,
  fmtBRL, fmtBRLShort, fmtNum,
} from "../../utils/format";
import TabSelector from "../Ui/TabSelector";
import { usePeriodFetch } from "../../hooks/usePeriodFetch";
import { dashboardService } from "../../services/dashboard.service";
import CardContainer from "../Ui/CardContainer";
import ErrorAlert from "../Ui/ErrorAlert";

const CATS = [
  { value: "TODOS",          label: "Todas"      },
  { value: "PRINCIPAL",      label: "Principais" },
  { value: "ACOMPANHAMENTO", label: "Acomp."     },
  { value: "BEBIDA",         label: "Bebidas"    },
  { value: "SOBREMESA",      label: "Sobremesas" },
];

export default function TopItens({ period }) {
  const fn = useCallback(() => dashboardService.getTopItens(period), [period]);
  const { dados, loading, erro } = usePeriodFetch(fn, "Não foi possível carregar os itens mais pedidos.");
  const [filtro, setFiltro] = useState("TODOS");

  const itens = useMemo(
    () => (filtro === "TODOS" ? dados : dados.filter((i) => i.categoria === filtro)),
    [filtro, dados]
  );

  const maxQtd     = itens[0]?.qtd || 1;
  const totalQtd   = itens.reduce((s, i) => s + i.qtd,     0);
  const totalRec   = itens.reduce((s, i) => s + i.receita, 0);

  return (
    <CardContainer>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Flame size={14} style={{ color: ACCENT.text }} />
              Itens mais pedidos
            </h3>
            {!loading && !erro && (
              <p className="text-slate-500 text-xs mt-0.5 tabular-nums">
                {fmtNum(totalQtd)} unidades · {fmtBRL(totalRec)}
              </p>
            )}
          </div>
        </div>

        {/* Filtros de categoria */}
        <div className="mt-3 mb-4">
          <TabSelector options={CATS} value={filtro} onChange={setFiltro} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <ul className="space-y-2.5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-slate-800/70 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-slate-800/70 rounded w-3/4" />
                  <div className="h-1.5 bg-slate-800/50 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Erro */}
        {!loading && erro && <ErrorAlert message={erro} />}

        {/* Lista */}
        {!loading && !erro && (
          <>
            {itens.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">
                Nenhum item encontrado para este período.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {itens.slice(0, 5).map((it, i) => {
                  const pct      = (it.qtd / maxQtd) * 100;
                  const catColor = CAT_COLOR[it.categoria] ?? ACCENT.from;
                  return (
                    <li key={it.id}>
                      <div className="flex items-center gap-3">
                        <span
                          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold tabular-nums"
                          style={{
                            background:  withAlpha(catColor, 0.15),
                            color:       catColor,
                            border:      `1px solid ${withAlpha(catColor, 0.3)}`,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white text-xs font-medium truncate">{it.nome}</span>
                              <span
                                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                                style={{ background: withAlpha(catColor, 0.15), color: catColor }}
                              >
                                {CAT_LABEL[it.categoria] ?? it.categoria}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-white text-xs font-bold tabular-nums">{fmtNum(it.qtd)}</span>
                              <span className="text-slate-500 text-[10px] tabular-nums">{fmtBRLShort(it.receita)}</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width:      `${pct}%`,
                                background: `linear-gradient(to right, ${catColor}, ${withAlpha(catColor, 0.8)})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </CardContainer>
  );
}
