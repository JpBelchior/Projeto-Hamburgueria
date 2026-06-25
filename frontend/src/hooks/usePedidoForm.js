import { useState, useEffect } from "react";
import { funcionarioService } from "../services/funcionario.service";
import useAuthStore from "../store/useAuthStore";

export function usePedidoForm(drawer, actions) {
  const isEditar = drawer.modo === "editar";
  const user     = useAuthStore((s) => s.user);

  const [form,         setForm]         = useState({ nomeCliente: "", mesa: "", formaPagamento: "", funcionarioId: "", itens: [] });
  const [funcionarios, setFuncionarios] = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [erro,         setErro]         = useState(null);

  useEffect(() => {
    funcionarioService.getAll()
      .then((list) => setFuncionarios(list.filter((f) => f.active)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!drawer.aberto) return;
    if (isEditar && drawer.dados) {
      const p = drawer.dados;

      // Agrupa itens com mesmo promocaoId em um único item de promoção
      const promoGroups = new Map();
      const regularRaw  = [];

      for (const i of (p.itens ?? [])) {
        if (i.promocaoId) {
          if (!promoGroups.has(i.promocaoId)) promoGroups.set(i.promocaoId, []);
          promoGroups.get(i.promocaoId).push(i);
        } else {
          regularRaw.push(i);
        }
      }

      const regularItens = regularRaw.map((i) => ({
        produtoId:     i.produtoId    ?? undefined,
        comboId:       i.comboId      ?? undefined,
        categoria:     i.produto?.categoria,
        comboProdutos: i.combo?.produtos ?? [],
        tipo:          i.produtoId ? "produto" : "combo",
        nome:          i.produto?.nome ?? i.combo?.nome ?? "Item excluído",
        quantidade:    i.quantidade,
        precoUnitario: i.precoUnitario,
        observacao:    i.observacao ?? "",
      }));

      const promoItens = [...promoGroups.entries()].map(([promocaoId, items]) => {
        const first = items[0];
        const nome  = first.promocao?.nome ?? "Promoção excluída";

        // Novo formato: um único item com só promocaoId
        if (items.length === 1 && !first.comboId && !first.produtoId) {
          return {
            promocaoId,
            tipo:             "promocao",
            nome,
            quantidade:       first.quantidade,
            precoUnitario:    first.precoUnitario,
            observacao:       first.observacao ?? "",
            promocaoCombos:   first.promocao?.combos   ?? [],
            promocaoProdutos: first.promocao?.produtos  ?? [],
          };
        }

        // Formato antigo: vários itens com mesmo promocaoId (combo/produto separados)
        const totalPreco = items.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
        return {
          promocaoId,
          tipo:             "promocao",
          nome,
          quantidade:       1,
          precoUnitario:    totalPreco,
          observacao:       "",
          promocaoCombos:   items.filter(i => i.comboId).map(i => ({ combo: { nome: i.combo?.nome }, quantidade: i.quantidade })),
          promocaoProdutos: items.filter(i => i.produtoId).map(i => ({ produto: { nome: i.produto?.nome }, quantidade: i.quantidade })),
        };
      });

      setForm({
        nomeCliente:    p.nomeCliente ?? "",
        mesa:           p.mesa != null ? String(p.mesa) : "",
        formaPagamento: p.formaPagamento ?? "",
        funcionarioId:  p.funcionarioId ? String(p.funcionarioId) : "",
        itens: [...regularItens, ...promoItens],
      });
    } else {
      const meuFunc = funcionarios.find((f) => f.user?.id === user?.id);
      setForm({ nomeCliente: "", mesa: "", formaPagamento: "", funcionarioId: meuFunc ? String(meuFunc.id) : "", itens: [] });
    }
    setErro(null);
  }, [drawer.aberto, drawer.dados]);

  // Caso funcionários carregue após o drawer abrir, preenche o padrão
  useEffect(() => {
    if (!drawer.aberto || isEditar) return;
    setForm((prev) => {
      if (prev.funcionarioId !== "") return prev;
      const meuFunc = funcionarios.find((f) => f.user?.id === user?.id);
      if (!meuFunc) return prev;
      return { ...prev, funcionarioId: String(meuFunc.id) };
    });
  }, [funcionarios]);

  const setField    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setItem     = (idx, k, v) =>
    setForm((p) => { const it = [...p.itens]; it[idx] = { ...it[idx], [k]: v }; return { ...p, itens: it }; });
  const removeItem  = (idx) => setForm((p) => ({ ...p, itens: p.itens.filter((_, i) => i !== idx) }));

  const addItem = (item, tipo) => {
    if (tipo === "promocao") {
      const precoUnitario = item.precoReal ?? item.precoTotal ?? 0;
      setForm((p) => ({
        ...p,
        itens: [
          ...p.itens,
          {
            promocaoId:       item.id,
            nome:             item.nome,
            tipo:             "promocao",
            quantidade:       1,
            precoUnitario,
            observacao:       "",
            promocaoCombos:   item.combos   ?? [],
            promocaoProdutos: item.produtos ?? [],
          },
        ],
      }));
      return;
    }

    const preco = tipo === "produto" ? item.precoVenda : item.preco;
    setForm((p) => ({
      ...p,
      itens: [
        ...p.itens,
        {
          ...(tipo === "produto"
            ? { produtoId: item.id, categoria: item.categoria }
            : { comboId: item.id, comboProdutos: item.produtos ?? [] }),
          nome:          item.nome,
          tipo,
          quantidade:    1,
          precoUnitario: preco,
          observacao:    "",
        },
      ],
    }));
  };

  const valorTotal = form.itens.reduce(
    (s, i) => s + (Number(i.quantidade) || 0) * (Number(i.precoUnitario) || 0),
    0,
  );

  const handleSubmit = async () => {
    if (form.itens.length === 0) { setErro("Adicione pelo menos um item."); return; }
    setSaving(true);
    setErro(null);
    try {
      const dto = {
        nomeCliente:    form.nomeCliente    || undefined,
        mesa:           form.mesa           ? Number(form.mesa) : undefined,
        formaPagamento: form.formaPagamento || undefined,
        funcionarioId:  form.funcionarioId  ? Number(form.funcionarioId) : undefined,
        itens: form.itens.map((i) => ({
          produtoId:     i.produtoId     || undefined,
          comboId:       i.comboId       || undefined,
          promocaoId:    i.promocaoId    || undefined,
          quantidade:    i.quantidade,
          precoUnitario: i.precoUnitario,
          observacao:    i.observacao    || undefined,
        })),
      };
      if (isEditar) await actions.update(drawer.dados.id, dto);
      else          await actions.create(dto);
    } catch {
      setErro("Erro ao salvar pedido.");
    } finally {
      setSaving(false);
    }
  };

  return { form, funcionarios, saving, erro, isEditar, setField, setItem, removeItem, addItem, valorTotal, handleSubmit };
}
