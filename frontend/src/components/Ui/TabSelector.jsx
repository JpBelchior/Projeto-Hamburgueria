import { ACCENT } from "../../utils/format";

/**
 * TabSelector — grupo de abas reutilizável
 *
 * Props:
 *   options  {{ value, label }[]}  lista de opções
 *   value    {string}              opção selecionada
 *   onChange {(v: string) => void}
 */
const TabSelector = ({ options, value, onChange }) => (
  <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1">
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            active ? "" : "text-slate-400 hover:text-white border border-transparent"
          }`}
          style={
            active
              ? { background: ACCENT.tint, color: ACCENT.text, border: `1px solid ${ACCENT.border}` }
              : undefined
          }
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default TabSelector;
