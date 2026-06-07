import { X, Plus } from "lucide-react";
import TabSelector from "../Ui/TabSelector";
import SearchBar from "../Ui/SearchBar";
import Button from "../Ui/Button";
import { FORMAS_PAGAMENTO } from "../../constants";

const PAGAMENTOS = [{ value: "", label: "Todas formas" }, ...FORMAS_PAGAMENTO];

const STATUS_OPTS = [
  { value: "",           label: "Todos"       },
  { value: "ABERTO",     label: "Aberto"      },
  { value: "EM_PREPARO", label: "Em preparo"  },
  { value: "FINALIZADO", label: "Finalizado"  },
  { value: "CANCELADO",  label: "Cancelado"   },
];

export default function PedidosFilters({ filters, setFilter, resetFilters, onNewPedido }) {
  const dirty = filters.formaPagamento !== "" || filters.status !== "";

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-[180px] max-w-xs">
        <SearchBar
          value={filters.busca ?? ""}
          onChange={(v) => setFilter("busca", v)}
          placeholder="Buscar nº ou cliente…"
        />
      </div>

      <TabSelector
        options={STATUS_OPTS}
        value={filters.status}
        onChange={(v) => setFilter("status", v)}
      />

      <TabSelector
        options={PAGAMENTOS}
        value={filters.formaPagamento}
        onChange={(v) => setFilter("formaPagamento", v)}
      />

      {dirty && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all"
        >
          <X size={12} />
          Limpar
        </button>
      )}

      <div className="ml-auto">
        <Button icon={Plus} size="sm" onClick={onNewPedido}>
          Novo Pedido
        </Button>
      </div>
    </div>
  );
}
