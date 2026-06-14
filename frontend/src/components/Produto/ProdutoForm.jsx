import { useState, useEffect, useRef } from "react";
import { Search, Trash2 } from "lucide-react";
import { ingredienteService } from "../../services/ingrediente.service";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import { CATEGORIA_OPTIONS, UNIDADE_LABEL } from "../../constants";
import { INPUT_CLS as inputCls } from "../../utils/format";

// ── Seletor de ingrediente ────────────────────────────────────────────────────

function IngredienteSelector({ disponiveis, selecionados, onAdd }) {
  const [busca,   setBusca]   = useState("");
  const [aberto,  setAberto]  = useState(false);
  const ref = useRef(null);

  const idsSelecionados = new Set(selecionados.map((i) => i.ingredienteId));

  const filtrados = busca.trim()
    ? disponiveis.filter(
        (i) =>
          !idsSelecionados.has(i.id) &&
          i.nome.toLowerCase().includes(busca.toLowerCase()),
      )
    : [];

  const handleSelect = (ing) => {
    onAdd({ ingredienteId: ing.id, nome: ing.nome, unidade: ing.unidade, quantidadeUsada: 1 });
    setBusca("");
    setAberto(false);
  };

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
          placeholder="Buscar ingrediente pelo nome…"
          className="w-full pl-8 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
        />
      </div>

      {aberto && busca.trim() && filtrados.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filtrados.map((ing) => (
            <button
              key={ing.id}
              onMouseDown={() => handleSelect(ing)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-slate-700/60 transition-colors text-left"
            >
              <span className="text-white text-xs truncate">{ing.nome}</span>
              <span className="text-slate-500 text-[10px] shrink-0">{UNIDADE_LABEL[ing.unidade] ?? ing.unidade}</span>
            </button>
          ))}
        </div>
      )}

      {aberto && busca.trim() && filtrados.length === 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-500">
          Nenhum ingrediente encontrado
        </div>
      )}
    </div>
  );
}

// ── Formulário principal ──────────────────────────────────────────────────────

export default function ProdutoForm({ initialData, onSubmit, onCancel, loading, erro }) {
  const [form, setForm] = useState({
    nome:                 initialData?.nome                 ?? "",
    descricao:            initialData?.descricao            ?? "",
    categoria:            initialData?.categoria            ?? "PRINCIPAL",
    precoVenda:           initialData?.precoVenda           ?? "",
    precoProducao:        initialData?.precoProducao        ?? "",
    tempoPreparoEstimado: initialData?.tempoPreparoEstimado ?? "",
  });

  const [ingredientesSel, setIngredientesSel] = useState(
    initialData?.ingredientes?.map((pi) => ({
      ingredienteId:   pi.ingredienteId,
      nome:            pi.ingrediente.nome,
      unidade:         pi.ingrediente.unidade,
      quantidadeUsada: pi.quantidadeUsada,
    })) ?? []
  );

  const [ingredientesDisp, setIngredientesDisp] = useState([]);

  useEffect(() => {
    ingredienteService.getAll().then(setIngredientesDisp).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addIngrediente = (ing) => setIngredientesSel((prev) => [...prev, ing]);

  const removeIngrediente = (ingredienteId) =>
    setIngredientesSel((prev) => prev.filter((i) => i.ingredienteId !== ingredienteId));

  const setQtd = (ingredienteId, value) =>
    setIngredientesSel((prev) =>
      prev.map((i) => (i.ingredienteId === ingredienteId ? { ...i, quantidadeUsada: value } : i))
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome:                 form.nome,
      descricao:            form.descricao || null,
      categoria:            form.categoria,
      precoVenda:           Number(form.precoVenda),
      precoProducao:        form.precoProducao !== "" ? Number(form.precoProducao) : null,
      tempoPreparoEstimado: form.tempoPreparoEstimado !== "" ? Number(form.tempoPreparoEstimado) : null,
      ingredientes:         ingredientesSel.map(({ ingredienteId, quantidadeUsada }) => ({
        ingredienteId,
        quantidadeUsada: Number(quantidadeUsada),
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
          placeholder="Nome do produto"
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

      <FormField label="Categoria" required>
        <select className={inputCls} value={form.categoria} onChange={set("categoria")}>
          {CATEGORIA_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Preço de Venda (R$)" required>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={form.precoVenda}
            onChange={set("precoVenda")}
            required
            placeholder="0,00"
          />
        </FormField>
        <FormField label="Preço de Custo (R$)">
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={form.precoProducao}
            onChange={set("precoProducao")}
            placeholder="0,00"
          />
        </FormField>
      </div>

      <FormField label="Tempo de Preparo (min)">
        <input
          className={inputCls}
          type="number"
          min="1"
          value={form.tempoPreparoEstimado}
          onChange={set("tempoPreparoEstimado")}
          placeholder="—"
        />
      </FormField>

      {/* Ingredientes */}
      <div>
        <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
          Ingredientes · Ficha Técnica
        </label>

        <IngredienteSelector
          disponiveis={ingredientesDisp}
          selecionados={ingredientesSel}
          onAdd={addIngrediente}
        />

        {ingredientesSel.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            {ingredientesSel.map((ing) => (
              <div
                key={ing.ingredienteId}
                className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 flex items-center gap-3"
              >
                <span className="text-white text-xs flex-1 truncate">{ing.nome}</span>
                <input
                  type="number"
                  step={ing.unidade === "UNIDADE" ? "1" : "0.1"}
                  min={ing.unidade === "UNIDADE" ? "1" : "0.1"}
                  value={ing.quantidadeUsada}
                  onChange={(e) => setQtd(ing.ingredienteId, e.target.value)}
                  className="w-20 bg-slate-700/50 border border-slate-600/40 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
                <span className="text-slate-500 text-[10px] w-6 shrink-0">
                  {UNIDADE_LABEL[ing.unidade] ?? ing.unidade}
                </span>
                <button
                  type="button"
                  onClick={() => removeIngrediente(ing.ingredienteId)}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {ingredientesSel.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-3 italic">
            Busque um ingrediente acima para adicionar à ficha técnica
          </p>
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
