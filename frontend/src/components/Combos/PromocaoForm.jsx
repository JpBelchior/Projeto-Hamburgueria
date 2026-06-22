import { useState, useEffect, useRef } from "react";
import { Search, Trash2 } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import { produtoService } from "../../services/produto.service";
import { comboService } from "../../services/combo.service";
import { fmtBRL, INPUT_CLS as inputCls } from "../../utils/format";

// ── Seletor genérico ──────────────────────────────────────────────────────────

function ItemSelector({ disponiveis, selecionados, onAdd, placeholder, renderLabel }) {
  const [busca,  setBusca]  = useState("");
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  const idsSelecionados = new Set(selecionados.map((i) => i.id));

  const filtrados = busca.trim()
    ? disponiveis.filter(
        (i) => !idsSelecionados.has(i.id) && i.nome.toLowerCase().includes(busca.toLowerCase())
      )
    : [];

  return (
    <div className="relative" ref={ref}>
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
              key={item.id}
              onMouseDown={() => { onAdd(item); setBusca(""); setAberto(false); }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-700/60 transition-colors text-left"
            >
              <span className="text-white text-xs truncate">{item.nome}</span>
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

// ── Formulário principal ──────────────────────────────────────────────────────

export default function PromocaoForm({ initialData, onSubmit, onCancel, loading, erro }) {
  const [form, setForm] = useState({
    nome:         initialData?.nome         ?? "",
    descricao:    initialData?.descricao    ?? "",
    desconto:     initialData?.desconto     ?? "",
    tempoPreparo: initialData?.tempoPreparo ?? "",
  });

  const [combosSel, setCombosSel] = useState(
    initialData?.combos?.map((pc) => ({ id: pc.combo.id, nome: pc.combo.nome, preco: pc.combo.preco })) ?? []
  );

  const [produtosSel, setProdutosSel] = useState(
    initialData?.produtos?.map((pp) => ({ id: pp.produto.id, nome: pp.produto.nome, precoVenda: pp.produto.precoVenda })) ?? []
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
      comboIds:     combosSel.map((c) => c.id),
      produtoIds:   produtosSel.map((p) => p.id),
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
            min="0"
            max="100"
            value={form.desconto}
            onChange={set("desconto")}
            placeholder="—"
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
        <ItemSelector
          disponiveis={combosDisp}
          selecionados={combosSel}
          onAdd={(c) => setCombosSel((prev) => [...prev, { id: c.id, nome: c.nome, preco: c.preco }])}
          placeholder="Buscar combo pelo nome…"
          renderLabel={(c) => fmtBRL(c.preco)}
        />
        {combosSel.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {combosSel.map((c) => (
              <div key={c.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 flex items-center gap-3">
                <span className="text-white text-xs flex-1 truncate">{c.nome}</span>
                <span className="text-slate-500 text-[10px] shrink-0">{fmtBRL(c.preco)}</span>
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
        <ItemSelector
          disponiveis={produtosDisp}
          selecionados={produtosSel}
          onAdd={(p) => setProdutosSel((prev) => [...prev, { id: p.id, nome: p.nome, precoVenda: p.precoVenda }])}
          placeholder="Buscar produto pelo nome…"
          renderLabel={(p) => fmtBRL(p.precoVenda)}
        />
        {produtosSel.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {produtosSel.map((p) => (
              <div key={p.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 flex items-center gap-3">
                <span className="text-white text-xs flex-1 truncate">{p.nome}</span>
                <span className="text-slate-500 text-[10px] shrink-0">{fmtBRL(p.precoVenda)}</span>
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
