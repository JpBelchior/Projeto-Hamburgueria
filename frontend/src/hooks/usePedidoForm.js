import { useState, useEffect } from "react";
import { funcionarioService } from "../services/Funcionario.service";

export function usePedidoForm(drawer, actions) {
  const isEditar = drawer.modo === "editar";

  const [form,         setForm]         = useState({ nomeCliente: "", formaPagamento: "", funcionarioId: "", itens: [] });
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
      setForm({
        nomeCliente:    p.nomeCliente ?? "",
        formaPagamento: p.formaPagamento ?? "",
        funcionarioId:  p.funcionarioId ? String(p.funcionarioId) : "",
        itens: (p.itens ?? []).map((i) => ({
          nome:          i.produto?.nome ?? i.combo?.nome ?? "",
          quantidade:    i.quantidade,
          precoUnitario: i.precoUnitario,
          observacao:    i.observacao ?? "",
        })),
      });
    } else {
      setForm({ nomeCliente: "", formaPagamento: "", funcionarioId: "", itens: [] });
    }
    setErro(null);
  }, [drawer.aberto, drawer.dados]);

  const setField    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setItem     = (idx, k, v) =>
    setForm((p) => { const it = [...p.itens]; it[idx] = { ...it[idx], [k]: v }; return { ...p, itens: it }; });
  const removeItem  = (idx) => setForm((p) => ({ ...p, itens: p.itens.filter((_, i) => i !== idx) }));

  const addItem = (item, tipo) => {
    const preco = tipo === "produto"
      ? item.precoVenda * (1 - (item.desconto ?? 0) / 100)
      : item.preco;
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
        formaPagamento: form.formaPagamento || undefined,
        funcionarioId:  form.funcionarioId  ? Number(form.funcionarioId) : undefined,
        itens: form.itens.map((i) => ({
          produtoId:     i.produtoId     || undefined,
          comboId:       i.comboId       || undefined,
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
