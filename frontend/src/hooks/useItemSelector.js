import { useState, useEffect } from "react";
import { produtoService } from "../services/produto.service";
import { comboService }   from "../services/combo.service";

export function useItemSelector() {
  const [aba,      setAba]      = useState("produto");
  const [busca,    setBusca]    = useState("");
  const [produtos, setProdutos] = useState([]);
  const [combos,   setCombos]   = useState([]);
  const [aberto,   setAberto]   = useState(false);

  useEffect(() => {
    produtoService.getAll().then(setProdutos).catch(() => {});
    comboService.getAll().then(setCombos).catch(() => {});
  }, []);

  const lista     = aba === "produto" ? produtos : combos;
  const filtrados = busca.trim()
    ? lista.filter((i) => i.nome.toLowerCase().includes(busca.toLowerCase()))
    : lista;

  const handleAba = (novaAba) => { setAba(novaAba); setBusca(""); };
  const clearSearch = () => { setBusca(""); setAberto(false); };

  return { aba, busca, setBusca, aberto, setAberto, filtrados, handleAba, clearSearch };
}
