import { useState } from "react";
import { Search } from "lucide-react";

export default function EntitySelector({ disponiveis, selecionadosIds = [], onAdd, placeholder, renderLabel, getName }) {
  const [busca,  setBusca]  = useState("");
  const [aberto, setAberto] = useState(false);

  const getNome   = getName ?? ((i) => i.nome);
  const idSet     = new Set(selecionadosIds);
  const filtrados = busca.trim()
    ? disponiveis.filter((i) => !idSet.has(i.id) && getNome(i).toLowerCase().includes(busca.toLowerCase()))
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          placeholder={placeholder}
          className="w-full pl-8 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
        />
      </div>

      {aberto && busca.trim() && filtrados.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filtrados.map((item) => (
            <button
              type="button"
              key={item.id}
              onMouseDown={() => { onAdd(item); setBusca(""); setAberto(false); }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-700/60 transition-colors text-left"
            >
              <span className="text-white text-xs truncate">{getNome(item)}</span>
              {renderLabel && (
                <span className="text-slate-500 text-[10px] shrink-0">{renderLabel(item)}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {aberto && busca.trim() && filtrados.length === 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-500">
          Nenhum resultado encontrado
        </div>
      )}
    </div>
  );
}
