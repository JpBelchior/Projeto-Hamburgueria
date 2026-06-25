import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import EntitySelector from "../Ui/EntitySelector";
import { produtoService } from "../../services/produto.service";
import { comboService } from "../../services/combo.service";
import { fmtBRL, INPUT_CLS as inputCls, clampDesconto } from "../../utils/format";

export default function PromocaoForm({ initialData, onSubmit, onCancel, loading, erro }) {
  const [form, setForm] = useState({
    nome:         initialData?.nome         ?? "",
    descricao:    initialData?.descricao    ?? "",
    desconto:     initialData?.desconto     ?? "",
    tempoPreparo: initialData?.tempoPreparo ?? "",
  });

  const [combosSel, setCombosSel] = useState(
    initialData?.combos?.map((pc) => ({ id: pc.combo.id, nome: pc.combo.nome, preco: pc.combo.preco, quantidade: pc.quantidade ?? 1 })) ?? []
  );

  const [produtosSel, setProdutosSel] = useState(
    initialData?.produtos?.map((pp) => ({ id: pp.produto.id, nome: pp.produto.nome, precoVenda: pp.produto.precoVenda, quantidade: pp.quantidade ?? 1 })) ?? []
  );

  const [combosDisp,   setCombosDisp]   = useState([]);
  const [produtosDisp, setProdutosDisp] = useState([]);

  useEffect(() => {
    comboService.getAll("", true).then(setCombosDisp).catch(() => {});
    produtoService.getAll("", "", true).then(setProdutosDisp).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome:         form.nome,
      descricao:    form.descricao  || null,
      desconto:     form.desconto !== "" ? Number(form.desconto) : null,
      tempoPreparo: form.tempoPreparo !== "" ? Number(form.tempoPreparo) : null,
      combos:   combosSel.map(({ id, quantidade }) => ({ id, quantidade: Math.max(1, Number(quantidade) || 1) })),
      produtos: produtosSel.map(({ id, quantidade }) => ({ id, quantidade: Math.max(1, Number(quantidade) || 1) })),
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
          placeholder="Nome da promoção"
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
        <FormField label="Desconto (%)">
          <input
            className={inputCls}
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            required
            value={form.desconto}
            onChange={set("desconto")}
            onBlur={(e) => setForm((f) => ({ ...f, desconto: e.target.value !== "" ? clampDesconto(e.target.value) : "" }))}
            placeholder="Ex: 10"
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

      {/* Combos */}
      <div>
        <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
          Combos
        </label>
        <EntitySelector
          disponiveis={combosDisp}
          selecionadosIds={combosSel.map((c) => c.id)}
          onAdd={(c) => setCombosSel((prev) => [...prev, { id: c.id, nome: c.nome, preco: c.preco, quantidade: 1 }])}
          placeholder="Buscar combo pelo nome…"
          renderLabel={(c) => fmtBRL(c.preco)}
        />
        {combosSel.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {combosSel.map((c) => (
              <div key={c.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 flex items-center gap-3">
                <span className="text-white text-xs flex-1 truncate">{c.nome}</span>
                <span className="text-slate-500 text-[10px] shrink-0">{fmtBRL(c.preco)}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={c.quantidade}
                  onChange={(e) => setCombosSel((prev) => prev.map((x) => x.id === c.id ? { ...x, quantidade: e.target.value } : x))}
                  onBlur={(e) => setCombosSel((prev) => prev.map((x) => x.id === c.id ? { ...x, quantidade: Math.max(1, Number(e.target.value) || 1) } : x))}
                  className="w-14 bg-slate-700/50 border border-slate-600/40 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setCombosSel((prev) => prev.filter((x) => x.id !== c.id))}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        {combosSel.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-2 italic">Nenhum combo selecionado</p>
        )}
      </div>

      {/* Produtos */}
      <div>
        <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
          Produtos
        </label>
        <EntitySelector
          disponiveis={produtosDisp}
          selecionadosIds={produtosSel.map((p) => p.id)}
          onAdd={(p) => setProdutosSel((prev) => [...prev, { id: p.id, nome: p.nome, precoVenda: p.precoVenda, quantidade: 1 }])}
          placeholder="Buscar produto pelo nome…"
          renderLabel={(p) => fmtBRL(p.precoVenda)}
        />
        {produtosSel.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {produtosSel.map((p) => (
              <div key={p.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 flex items-center gap-3">
                <span className="text-white text-xs flex-1 truncate">{p.nome}</span>
                <span className="text-slate-500 text-[10px] shrink-0">{fmtBRL(p.precoVenda)}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={p.quantidade}
                  onChange={(e) => setProdutosSel((prev) => prev.map((x) => x.id === p.id ? { ...x, quantidade: e.target.value } : x))}
                  onBlur={(e) => setProdutosSel((prev) => prev.map((x) => x.id === p.id ? { ...x, quantidade: Math.max(1, Number(e.target.value) || 1) } : x))}
                  className="w-14 bg-slate-700/50 border border-slate-600/40 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setProdutosSel((prev) => prev.filter((x) => x.id !== p.id))}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        {produtosSel.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-2 italic">Nenhum produto selecionado</p>
        )}
      </div>

      {erro && <p className="text-red-400 text-xs">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
