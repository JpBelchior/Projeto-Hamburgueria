/**
 * FuncionarioForm — formulário de criar/editar funcionário
 *
 * Props:
 *   initialData  {object}    — dados iniciais (edição) ou null (criação)
 *   onSubmit     {function}  — callback com os dados do formulário
 *   onCancel     {function}  — callback ao cancelar
 *   isLoading    {boolean}   — desabilita o formulário durante requisição
 */

import { useEffect, useState, useRef } from "react";
import PasswordToggle from "../Ui/PasswordToggle";
import { formatTelefone } from "../../utils/Date.utils";
import { roleService } from "../../services/funcionario.service";
import { CARGO_OPTIONS } from "../../constants";
import Button from "../Ui/Button";
import FormField from "../Ui/FormField";

const EMPTY_FORM = {
  name: "",
  cpf: "",
  email: "",
  telefone:"",
  password: "",
  role: "ATENDENTE",
  cargo: "ATENDENTE",
  salario: "",
};

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
      telefone: initialData.user?.telefone ?? "",
      password: "",
      role: initialData.user?.roles[0]?.role?.name ?? "ATENDENTE",
      cargo: initialData.cargo ?? "ATENDENTE",
      salario: initialData.salario ?? "",
    };
  });

  const handleChange = (field) => (e) => {
    const value = field === "telefone" ? formatTelefone(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
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
            <FormField label="Nome completo" required>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Ex: João Silva"
                className={inputClass}
                disabled={isLoading}
                required
              />
            </FormField>
          </div>

          <FormField label="CPF" required>
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
          </FormField>

          <FormField label="E-mail" required>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="email@exemplo.com"
              className={inputClass}
              disabled={isLoading}
              required
            />
          </FormField>

          <div className="col-span-2">
            <FormField label={isEditing ? "Nova senha (deixe vazio para manter)" : "Senha"} required={!isEditing}>
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
            </FormField>
          </div>
            <FormField label="Telefone" required>
            <input
              type="tel"
              value={form.telefone}
              onChange={handleChange("telefone")}
              placeholder="(XX) 99999-9999"
              className={inputClass}
              disabled={isLoading}
              required
            />
          </FormField>
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
            <FormField label="Nível de acesso" required>
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
            </FormField>
          )}

          <FormField label="Cargo" required>
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
          </FormField>

          <FormField label="Salário (R$)" required>
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
          </FormField>

        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar funcionário"}
        </Button>
      </div>
    </form>
  );
};

export default FuncionarioForm;