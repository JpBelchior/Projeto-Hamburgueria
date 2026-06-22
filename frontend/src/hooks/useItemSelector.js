import { useState, useEffect } from "react";
import { produtoService }  from "../services/produto.service";
import { comboService }    from "../services/combo.service";
import { promocaoService } from "../services/promocao.service";

export function useItemSelector() {
  const [aba,       setAba]       = useState("produto");
  const [busca,     setBusca]     = useState("");
  const [produtos,  setProdutos]  = useState([]);
  const [combos,    setCombos]    = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [aberto,    setAberto]    = useState(false);

  useEffect(() => {
    produtoService.getAll().then(setProdutos).catch(() => {});
    comboService.getAll().then(setCombos).catch(() => {});
    promocaoService.getAll().then(setPromocoes).catch(() => {});
  }, []);

  const lista = aba === "produto" ? produtos : aba === "combo" ? combos : promocoes;
  const filtrados = busca.trim()
    ? lista.filter((i) => i.nome.toLowerCase().includes(busca.toLowerCase()))
    : lista;

  const handleAba   = (novaAba) => { setAba(novaAba); setBusca(""); };
  const clearSearch = () => { setBusca(""); setAberto(false); };

  return { aba, busca, setBusca, aberto, setAberto, filtrados, handleAba, clearSearch };
}
