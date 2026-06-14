import { useState } from "react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import { INPUT_CLS as inputCls } from "../../utils/format";
import { UNIDADE_OPTIONS } from "../../constants";

export default function IngredienteForm({ initialData, onSubmit, onCancel, loading, erro }) {
  const [form, setForm] = useState({
    nome:            initialData?.nome            ?? "",
    unidade:         initialData?.unidade         ?? "KG",
    quantidadeAtual: initialData?.quantidadeAtual ?? "",
    estoqueMinimo:   initialData?.estoqueMinimo   ?? "",
    essencial:       initialData?.essencial       ?? false,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nome:            form.nome,
      unidade:         form.unidade,
      quantidadeAtual: Number(form.quantidadeAtual),
      estoqueMinimo:   form.estoqueMinimo !== "" ? Number(form.estoqueMinimo) : null,
      essencial:       form.essencial,
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
          placeholder="Ex: Carne bovina, Farinha de trigo…"
        />
      </FormField>

      <FormField label="Unidade de Medida" required>
        <select className={inputCls} value={form.unidade} onChange={set("unidade")}>
          {UNIDADE_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Estoque Atual" required>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={form.quantidadeAtual}
            onChange={set("quantidadeAtual")}
            required
            placeholder="0"
          />
        </FormField>
        <FormField label="Estoque Mínimo">
          <input
            className={inputCls}
            type="number"
            step="0.01"
            min="0"
            value={form.estoqueMinimo}
            onChange={set("estoqueMinimo")}
            placeholder="—"
          />
        </FormField>
      </div>

      {/* Toggle essencial */}
      <div
        className="flex items-center justify-between bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 cursor-pointer"
        onClick={() => setForm((f) => ({ ...f, essencial: !f.essencial }))}
      >
        <div>
          <p className="text-white text-xs font-medium">Ingrediente Essencial</p>
          <p className="text-slate-500 text-[11px] mt-0.5">Monitorado com prioridade no estoque</p>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${form.essencial ? "bg-amber-500" : "bg-slate-700"}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.essencial ? "left-5" : "left-0.5"}`} />
        </div>
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
