import { X } from "lucide-react";
import SearchBar from "./SearchBar";
import TabSelector from "./TabSelector";
import Button from "./Button";

/**
 * Filter — barra de filtros reutilizável
 *
 * Props:
 *   search   {{ value, onChange, placeholder }}   — SearchBar
 *   tabs     {{ options, value, onChange }[]}     — um ou mais TabSelectors
 *   dirty    {boolean}                            — exibe botão "Limpar"
 *   onReset  {function}                           — limpa todos os filtros
 *   action   {{ label, icon, onClick }}           — botão de ação (direita)
 */
export default function Filter({ search, tabs = [], dirty, onReset, action }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-3">

      {search && (
        <div className="min-w-[180px] max-w-xs flex-1">
          <SearchBar
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
          />
        </div>
      )}

      {tabs.map((tab, i) => (
        <TabSelector
          key={i}
          options={tab.options}
          value={tab.value}
          onChange={tab.onChange}
        />
      ))}

      <div className="flex-1" />

      {action && (
        <>
          {tabs.length > 0 && (
            <div className="w-px h-5 bg-slate-700/60" />
          )}
          <Button icon={action.icon} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </>
      )}

    </div>
  );
}
