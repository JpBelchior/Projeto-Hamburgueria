import { RefreshCw } from "lucide-react";
import { ACCENT } from "../../utils/format";
import Button from "./Button";
import TabSelector from "./TabSelector";

const DEFAULT_PERIODS = [
  { value: "hoje",  label: "Hoje"    },
  { value: "7d",    label: "7 dias"  },
  { value: "30d",   label: "30 dias" },
  { value: "ano",   label: "Anual"   },
];

/**
 * HeaderBar — cabeçalho padronizado de página
 *
 * Props:
 *   title      {string}          título da página (obrigatório)
 *   subtitle   {string}          texto fixo abaixo do título; se omitido, mostra a data
 *   period     {string}          período selecionado — ativa o seletor de períodos
 *   setPeriod  {(v)=>void}
 *   periods    {{value,label}[]} opções de período (padrão: hoje/7d/30d/ano)
 *   onRefresh  {()=>void}        ativa o botão "Atualizar"
 *   refreshing {bool}
 */
export default function HeaderBar({
  title,
  subtitle,
  period,
  setPeriod,
  periods = DEFAULT_PERIODS,
  onRefresh,
  refreshing,
}) {
  const now     = new Date();
  const dataStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const horaStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const showPeriods = period !== undefined && setPeriod;

  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-4">

        <div>
          <h1
            className="inline-block text-2xl font-bold bg-clip-text text-transparent tracking-tight"
            style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
          >
            {title}
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            {subtitle ? (
              subtitle
            ) : (
              <>
                <span className="capitalize">{dataStr}</span>
                {onRefresh && (
                  <>
                    <span className="text-slate-700 mx-2">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-flex rounded-full w-1.5 h-1.5"
                        style={{ background: ACCENT.from }}
                      />
                      ao vivo · atualizado às {horaStr}
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {(showPeriods || onRefresh) && (
          <div className="flex items-center gap-2">

            {showPeriods && (
              <TabSelector options={periods} value={period} onChange={setPeriod} />
            )}

            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw
                  size={13}
                  className={`shrink-0${refreshing ? " animate-spin" : ""}`}
                  style={{ color: ACCENT.text }}
                />
                <span className="hidden md:inline">Atualizar</span>
              </Button>
            )}

          </div>
        )}
      </div>

      <div
        className="h-px"
        style={{ background: `linear-gradient(to right, ${ACCENT.from}55, ${ACCENT.from}1a, transparent)` }}
      />
    </div>
  );
}
