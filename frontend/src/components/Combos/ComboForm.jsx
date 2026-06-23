import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import EntitySelector from "../Ui/EntitySelector";
import { produtoService } from "../../services/produto.service";
import { fmtBRL, INPUT_CLS as inputCls } from "../../utils/format";

export default function ComboForm({ initialData, onSubmit, onCancel, loading, erro }) {
  const [form, setForm] = useState({
    nome:         initialData?.nome         ?? "",
    descricao:    initialData?.descricao    ?? "",
    preco:        initialData?.preco        ?? "",
    tempoPreparo: initialData?.tempoPreparo ?? "",
  });

  const [produtosSel, setProdutosSel] = useState(
    initialData?.produtos?.map((cp) => ({
      produtoId:  cp.produto.id,
      nome:       cp.produto.nome,
      precoVenda: cp.produto.precoVenda,
      quantidade: cp.quantidade,
    })) ?? []
  );

  const [produtosDisp, setProdutosDisp] = useState([]);

  useEffect(() => {
    produtoService.getAll("", "", true).then(setProdutosDisp).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addProduto = (p) => setProdutosSel((prev) => [...prev, p]);

  const removeProduto = (produtoId) =>
    setProdutosSel((prev) => prev.filter((p) => p.produtoId !== produtoId));

  const setQtd = (produtoId, value) =>
    setProdutosSel((prev) =>
      prev.map((p) => (p.produtoId === produtoId ? { ...p, quantidade: value } : p))
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome:         form.nome,
      descricao:    form.descricao || null,
      preco:        Number(form.preco),
      tempoPreparo: form.tempoPreparo !== "" ? Number(form.tempoPreparo) : null,
      produtos:     produtosSel.map(({ produtoId, quantidade }) => ({
        produtoId,
        quantidade: Math.max(1, Number(quantidade) || 1),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <FormField label="Nome" required>
        <input
          className={inputCls}
          value={form.nome}
          onChange={set("nome")}
          required
          placeholder="Nome do combo"
        />
      </FormField>

      <FormField label="Descrição">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.descricao}
          onChange={set("descricao")}
          placeholder="Descrição opcional"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Preço (R$)" required>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={form.preco}
            onChange={set("preco")}
            required
            placeholder="0,00"
          />
        </FormField>
        <FormField label="Tempo de Preparo (min)">
          <input
            className={inputCls}
            type="number"
            min="1"
            value={form.tempoPreparo}
            onChange={set("tempoPreparo")}
            placeholder="—"
          />
        </FormField>
      </div>

      {/* Produtos */}
      <div>
        <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
          Produtos do Combo
        </label>

        <EntitySelector
          disponiveis={produtosDisp}
          selecionadosIds={produtosSel.map((p) => p.produtoId)}
          onAdd={(p) => addProduto({ produtoId: p.id, nome: p.nome, precoVenda: p.precoVenda, quantidade: 1 })}
          placeholder="Buscar produto pelo nome…"
          renderLabel={(p) => fmtBRL(p.precoVenda)}
        />

        {produtosSel.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            {produtosSel.map((p) => (
              <div
                key={p.produtoId}
                className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 flex items-center gap-3"
              >
                <span className="text-white text-xs flex-1 truncate">{p.nome}</span>
                <span className="text-slate-500 text-[10px] shrink-0">{fmtBRL(p.precoVenda)}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={p.quantidade}
                  onChange={(e) => setQtd(p.produtoId, e.target.value)}
                  onBlur={(e) => setQtd(p.produtoId, Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 bg-slate-700/50 border border-slate-600/40 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeProduto(p.produtoId)}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {produtosSel.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-3 italic">
            Busque um produto acima para adicionar ao combo
          </p>
        )}
      </div>

      {erro && <p className="text-red-400 text-xs">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading || produtosSel.length === 0}>
          {loading ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
