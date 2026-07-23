import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import Filter from "../Ui/Filter";
import { cardapioService } from "../../services/cardapio.service";
import { FORMAS_PAGAMENTO } from "../../constants";

const PAGAMENTOS = [{ value: "", label: "Todas formas" }, ...FORMAS_PAGAMENTO];

const extrairNomeArquivo = (contentDisposition) => {
  const match = /filename="?([^"]+)"?/.exec(contentDisposition || "");
  return match?.[1] || "cardapio.pdf";
};

export default function PedidosFilters({ filters, setFilter, resetFilters, onNewPedido }) {
  const [gerandoCardapio, setGerandoCardapio] = useState(false);
  const dirty = filters.formaPagamento !== "" || (filters.mesa ?? "") !== "";

  const handleGerarCardapio = async () => {
    if (gerandoCardapio) return;
    setGerandoCardapio(true);
    try {
      const response = await cardapioService.baixarPDF();
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = extrairNomeArquivo(response.headers["content-disposition"]);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGerandoCardapio(false);
    }
  };

  return (
    <Filter
      search={[
        {
          value:       filters.busca ?? "",
          onChange:    (v) => setFilter("busca", v),
          placeholder: "Buscar nº ou cliente…",
        },
        {
          value:       filters.mesa ?? "",
          onChange:    (v) => setFilter("mesa", v.replace(/\D/g, "")),
          placeholder: "Nº da mesa…",
        },
      ]}
      tabs={[
        { options: PAGAMENTOS, value: filters.formaPagamento, onChange: (v) => setFilter("formaPagamento", v) },
      ]}
      dirty={dirty}
      onReset={resetFilters}
      actions={[
        { label: "Novo Pedido", icon: Plus, onClick: onNewPedido },
        {
          label:    gerandoCardapio ? "Gerando..." : "Gerar Cardápio",
          icon:     BookOpen,
          onClick:  handleGerarCardapio,
          disabled: gerandoCardapio,
        },
      ]}
    />
  );
}
