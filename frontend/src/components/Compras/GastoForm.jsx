import { useState, useEffect, useMemo } from "react";
import { Trash2 } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import EntitySelector from "../Ui/EntitySelector";
import { INPUT_CLS as inputCls, clampQtd } from "../../utils/format";
import { UNIDADE_LABEL } from "../../constants";
import { ingredienteService } from "../../services/ingrediente.service";
import { funcionarioService } from "../../services/funcionario.service";

const TIPOS = [
  { value: "INGREDIENTE", label: "Compra de Ingredientes" },
  { value: "FUNCIONARIO", label: "Pagamento de Funcionários" },
  { value: "GENERICO",    label: "Outro Gasto" },
];

export default function GastoForm({ initialData, tipoInicial, onSubmit, onCancel, loading, erro }) {
  const [tipo, setTipo] = useState(initialData?.tipo ?? tipoInicial ?? "INGREDIENTE");

  const [form, setForm] = useState({
    nome:      initialData?.nome      ?? "",
    valor:     initialData?.valor     ?? "",
    descricao: initialData?.descricao ?? "",
  });

  const [ingredientesSel, setIngredientesSel] = useState(
    initialData?.ingrediente?.ingredientes?.map((r) => ({
      ingredienteId: r.ingrediente.id,
      nome:          r.ingrediente.nome,
      unidade:       r.ingrediente.unidade,
      quantidade:    r.quantidade ?? 1,
    })) ?? [],
  );

  const [funcionariosSel, setFuncionariosSel] = useState(
    initialData?.funcionario?.funcionarios?.map((r) => ({
      funcionarioId: r.funcionario.id,
      nome:          r.funcionario.user?.name ?? "",
    })) ?? [],
  );

  const [disponiveis, setDisponiveis] = useState([]);

  const funcionariosDisp = useMemo(
    () => disponiveis.filter((f) => f.user?.name).map((f) => ({ ...f, nome: f.user.name })),
    [disponiveis],
  );

  useEffect(() => {
    if (tipo === "INGREDIENTE") {
      ingredienteService.getAll().then(setDisponiveis).catch(() => {});
    } else if (tipo === "FUNCIONARIO") {
      funcionarioService.getAll().then(setDisponiveis).catch(() => {});
    }
  }, [tipo]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addIngrediente    = (ing)           => setIngredientesSel((prev) => [...prev, ing]);
  const removeIngrediente = (ingredienteId) => setIngredientesSel((prev) => prev.filter((i) => i.ingredienteId !== ingredienteId));
  const setQtd            = (ingredienteId, value) =>
    setIngredientesSel((prev) =>
      prev.map((i) => (i.ingredienteId === ingredienteId ? { ...i, quantidade: value } : i)),
    );

  const addFuncionario    = (func)          => setFuncionariosSel((prev) => [...prev, func]);
  const removeFuncionario = (funcionarioId) => setFuncionariosSel((prev) => prev.filter((f) => f.funcionarioId !== funcionarioId));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      tipo,
      nome:      form.nome,
      valor:     Number(form.valor),
      descricao: form.descricao || undefined,
    };

    if (tipo === "INGREDIENTE") {
      payload.ingredientes = ingredientesSel.map(({ ingredienteId, quantidade, unidade }) => ({
        id: ingredienteId, quantidade: clampQtd(quantidade, unidade),
      }));
    } else if (tipo === "FUNCIONARIO") {
      payload.funcionarioIds = funcionariosSel.map((f) => f.funcionarioId);
    }

    onSubmit(payload);
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Tipo — desabilitado na edição */}
      <FormField label="Tipo de Gasto" required>
        <select
          className={inputCls}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          disabled={isEditing}
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Nome" required>
        <input
          className={inputCls}
          value={form.nome}
          onChange={set("nome")}
          required
          placeholder={
            tipo === "INGREDIENTE" ? "Ex: Compra de proteínas…" :
            tipo === "FUNCIONARIO" ? "Ex: Folha de pagamento…" :
            "Ex: Aluguel, energia…"
          }
        />
      </FormField>

      <FormField label="Valor (R$)" required>
        <input
          className={inputCls}
          type="number"
          step="0.01"
          min="0"
          value={form.valor}
          onChange={set("valor")}
          required
          placeholder="0,00"
        />
      </FormField>

      <FormField label="Descrição">
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={form.descricao}
          onChange={set("descricao")}
          placeholder="Observações opcionais…"
        />
      </FormField>

      {/* Seletor de vínculos — apenas para INGREDIENTE e FUNCIONARIO */}
      {tipo === "INGREDIENTE" && (
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
            Ingredientes
          </label>
          <EntitySelector
            disponiveis={disponiveis}
            selecionadosIds={ingredientesSel.map((i) => i.ingredienteId)}
            onAdd={(ing) => addIngrediente({ ingredienteId: ing.id, nome: ing.nome, unidade: ing.unidade, quantidade: 1 })}
            placeholder="Buscar ingrediente pelo nome…"
            renderLabel={(ing) => UNIDADE_LABEL[ing.unidade] ?? ing.unidade}
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
                    value={ing.quantidade}
                    onChange={(e) => setQtd(ing.ingredienteId, e.target.value)}
                    onBlur={(e) => setQtd(ing.ingredienteId, clampQtd(e.target.value, ing.unidade))}
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
              Busque um ingrediente acima para adicionar à compra
            </p>
          )}
        </div>
      )}

      {tipo === "FUNCIONARIO" && (
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-widest block mb-2">
            Funcionários
          </label>
          <EntitySelector
            disponiveis={funcionariosDisp}
            selecionadosIds={funcionariosSel.map((f) => f.funcionarioId)}
            onAdd={(f) => addFuncionario({ funcionarioId: f.id, nome: f.nome })}
            placeholder="Buscar funcionário pelo nome…"
          />
          {funcionariosSel.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {funcionariosSel.map((func) => (
                <div
                  key={func.funcionarioId}
                  className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 flex items-center gap-3"
                >
                  <span className="text-white text-xs flex-1 truncate">{func.nome}</span>
                  <button
                    type="button"
                    onClick={() => removeFuncionario(func.funcionarioId)}
                    className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {funcionariosSel.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-3 italic">
              Busque um funcionário acima para adicionar ao pagamento
            </p>
          )}
        </div>
      )}

      {erro && <p className="text-red-400 text-xs">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading} type="button">
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
