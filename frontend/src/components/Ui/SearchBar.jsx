/**
 * SearchBar — input de busca reutilizável
 *
 * Props:
 *   value        {string}    — valor controlado
 *   onChange     {function}  — callback de mudança
 *   placeholder  {string}    — texto placeholder (opcional)
 */

import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Buscar..." }) => {
  const handleClear = () => onChange("");

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search
          size={16}
          className="text-slate-500 group-focus-within:text-amber-400 transition-colors duration-200"
        />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-9 py-2.5
          bg-slate-800/50 border border-slate-700/50
          rounded-xl text-sm text-white placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40
          hover:border-slate-600/70 hover:bg-slate-800/70
          transition-all duration-200
        "
      />

      {/* Botão de limpar — só aparece quando há valor */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors duration-200"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;