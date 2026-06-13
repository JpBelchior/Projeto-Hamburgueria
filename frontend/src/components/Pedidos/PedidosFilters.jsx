import { Plus } from "lucide-react";
import Filter from "../Ui/Filter";
import { FORMAS_PAGAMENTO } from "../../constants";

const STATUS_OPTS = [
  { value: "",           label: "Todos"      },
  { value: "ABERTO",     label: "Aberto"     },
  { value: "EM_PREPARO", label: "Em preparo" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO",  label: "Cancelado"  },
];

const PAGAMENTOS = [{ value: "", label: "Todas formas" }, ...FORMAS_PAGAMENTO];

export default function PedidosFilters({ filters, setFilter, resetFilters, onNewPedido }) {
  const dirty = filters.formaPagamento !== "" || filters.status !== "";

  return (
    <Filter
      search={{
        value:       filters.busca ?? "",
        onChange:    (v) => setFilter("busca", v),
        placeholder: "Buscar nº ou cliente…",
      }}
      tabs={[
        { options: STATUS_OPTS, value: filters.status,         onChange: (v) => setFilter("status", v) },
        { options: PAGAMENTOS,  value: filters.formaPagamento, onChange: (v) => setFilter("formaPagamento", v) },
      ]}
      dirty={dirty}
      onReset={resetFilters}
      action={{ label: "Novo Pedido", icon: Plus, onClick: onNewPedido }}
    />
  );
}
