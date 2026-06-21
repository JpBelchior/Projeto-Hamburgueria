import { useState, useEffect, useRef } from "react";
import { Search, Trash2 } from "lucide-react";
import FormField from "../Ui/FormField";
import Button from "../Ui/Button";
import { INPUT_CLS as inputCls } from "../../utils/format";
import { UNIDADE_LABEL } from "../../constants";
import { ingredienteService } from "../../services/ingrediente.service";
import { funcionarioService } from "../../services/funcionario.service";

const TIPOS = [
  { value: "INGREDIENTE", label: "Compra de Ingredientes" },
  { value: "FUNCIONARIO", label: "Pagamento de Funcionários" },
  { value: "GENERICO",    label: "Outro Gasto" },
];

// ── Seletor de ingrediente ────────────────────────────────────────────────────

function IngredienteSelector({ disponiveis, selecionados, onAdd }) {
  const [busca,  setBusca]  = useState("");
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  const idsSel = new Set(selecionados.map((i) => i.ingredienteId));
  const filtrados = busca.trim()
    ? disponiveis.filter(
        (i) => !idsSel.has(i.id) && i.nome.toLowerCase().includes(busca.toLowerCase()),
      )
    : [];

  const handleSelect = (ing) => {
    onAdd({ ingredienteId: ing.id, nome: ing.nome, unidade: ing.unidade, quantidade: 1 });
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
              type="button"
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

// ── Seletor de funcionário ────────────────────────────────────────────────────

function FuncionarioSelector({ disponiveis, selecionados, onAdd }) {
  const [busca,  setBusca]  = useState("");
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  const idsSel = new Set(selecionados.map((f) => f.funcionarioId));
  const filtrados = busca.trim()
    ? disponiveis.filter((f) => {
        const nome = f.user?.name ?? "";
        return !idsSel.has(f.id) && nome.toLowerCase().includes(busca.toLowerCase());
      })
    : [];

  const handleSelect = (func) => {
    onAdd({ funcionarioId: func.id, nome: func.user?.name ?? "" });
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
          placeholder="Buscar funcionário pelo nome…"
          className="w-full pl-8 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
        />
      </div>
      {aberto && busca.trim() && filtrados.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filtrados.map((func) => (
            <button
              key={func.id}
              type="button"
              onMouseDown={() => handleSelect(func)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/60 transition-colors text-left"
            >
              <span className="text-white text-xs truncate">{func.user?.name}</span>
            </button>
          ))}
        </div>
      )}
      {aberto && busca.trim() && filtrados.length === 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-xs text-slate-500">
          Nenhum funcionário encontrado
        </div>
      )}
    </div>
  );
}

// ── Formulário principal ──────────────────────────────────────────────────────

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
      payload.ingredientes = ingredientesSel.map(({ ingredienteId, quantidade }) => ({
        id: ingredienteId,
        quantidade: Number(quantidade),
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
          step="1"
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
          <IngredienteSelector
            disponiveis={disponiveis}
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
                    step="1"
                    min={ing.unidade === "UNIDADE" ? "1" : "0.1"}
                    value={ing.quantidade}
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
          <FuncionarioSelector
            disponiveis={disponiveis}
            selecionados={funcionariosSel}
            onAdd={addFuncionario}
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
