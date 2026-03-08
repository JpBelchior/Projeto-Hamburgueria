/**
 * FuncionarioForm — formulário de criar/editar funcionário
 *
 * Props:
 *   initialData  {object}    — dados iniciais (edição) ou null (criação)
 *   onSubmit     {function}  — callback com os dados do formulário
 *   onCancel     {function}  — callback ao cancelar
 *   isLoading    {boolean}   — desabilita o formulário durante requisição
 */

import { useEffect, useState } from "react";
import PasswordToggle from "../../hooks/buttonPassword";
import { useRef } from "react";
import { roleService } from "../../services/role.service";

// ─────────────────────────────────────────
// Configurações estáticas
// ─────────────────────────────────────────

const CARGO_OPTIONS = [
  { value: "ATENDENTE", label: "Atendente" },
  { value: "COZINHEIRO", label: "Cozinheiro" },
  { value: "CAIXA", label: "Caixa" },
];

const EMPTY_FORM = {
  name: "",
  cpf: "",
  email: "",
  password: "",
  role: "ATENDENTE",
  cargo: "ATENDENTE",
  salario: "",
};

// ─────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-slate-400 text-xs font-medium tracking-wide uppercase">
      {label}
      {required && <span className="text-amber-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-white
  bg-slate-800/60 border border-slate-700/50
  placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40
  hover:border-slate-600/70
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────

const FuncionarioForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const isEditing = !!initialData;
  const passwordRef = useRef(null);
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    roleService.getAll().then(setRoleOptions);
  }, []);

  const [form, setForm] = useState(() => {
    if (!initialData) return EMPTY_FORM;

    // Edição — popula com dados existentes (sem expor senha)
    return {
      name: initialData.user?.name ?? "",
      cpf: initialData.user?.cpf ?? "",
      email: initialData.user?.email ?? "",
      password: "",
      role: initialData.user?.roles[0]?.role?.name ?? "ATENDENTE",
      cargo: initialData.cargo ?? "ATENDENTE",
      salario: initialData.salario ?? "",
    };
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const roleOption = roleOptions.find((r) => r.name === form.role);
    onSubmit({
      ...form,
      salario: Number(form.salario),
      roles: [{ id: roleOption.id }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Seção — Dados pessoais */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
          Dados Pessoais
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome completo" required>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Ex: João Silva"
                className={inputClass}
                disabled={isLoading}
                required
              />
            </Field>
          </div>

          <Field label="CPF" required>
            <input
              type="text"
              value={form.cpf}
              onChange={handleChange("cpf")}
              placeholder="000.000.000-00"
              maxLength={14}
              className={inputClass}
              disabled={isLoading}
              required
            />
          </Field>

          <Field label="E-mail" required>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="email@exemplo.com"
              className={inputClass}
              disabled={isLoading}
              required
            />
          </Field>

          <div className="col-span-2">
            <Field label={isEditing ? "Nova senha (deixe vazio para manter)" : "Senha"} required={!isEditing}>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                  disabled={isLoading}
                  required={!isEditing}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PasswordToggle inputRef={passwordRef} />
                </div>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="h-px bg-slate-800" />

      {/* Seção — Dados profissionais */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
          Dados Profissionais
        </p>
        <div className="grid grid-cols-2 gap-4">

          {!isEditing && (
            <Field label="Nível de acesso" required>
              <select
                value={form.role}
                onChange={handleChange("role")}
                className={inputClass}
                disabled={isLoading || roleOptions.length === 0}
                required
              >
                {roleOptions.map((opt) => (
                  <option key={opt.id} value={opt.name} className="bg-slate-800">
                    {opt.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Cargo" required>
            <select
              value={form.cargo}
              onChange={handleChange("cargo")}
              className={inputClass}
              disabled={isLoading}
              required
            >
              {CARGO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Salário (R$)" required>
            <input
              type="number"
              value={form.salario}
              onChange={handleChange("salario")}
              placeholder="2000"
              min={0}
              step={0.01}
              className={inputClass}
              disabled={isLoading}
              required
            />
          </Field>

        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-semibold shadow-md shadow-amber-500/10 hover:-translate-y-px active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar funcionário"}
        </button>
      </div>
    </form>
  );
};

export default FuncionarioForm;