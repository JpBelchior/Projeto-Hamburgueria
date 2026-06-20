import { ACCENT } from "../../utils/format";

const ConfiguracoesTabs = ({ tabs, value, onChange }) => (
  <div className="relative flex items-center gap-1 border-b border-slate-700/60">
    {tabs.map(({ value: v, label, icon: Icon }) => {
      const active = v === value;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium transition-all duration-200 ${
            active ? "text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {Icon && (
            <Icon
              size={15}
              style={active ? { color: ACCENT.text } : undefined}
            />
          )}
          {label}

          {/* indicador ativo */}
          {active && (
            <span
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
              style={{ background: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
            />
          )}
        </button>
      );
    })}
  </div>
);

export default ConfiguracoesTabs;
