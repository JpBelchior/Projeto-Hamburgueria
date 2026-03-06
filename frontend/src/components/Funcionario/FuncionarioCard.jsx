/**
 * FuncionarioCard — crachá de funcionário
 *
 * Props:
 *   funcionario  {object}    — dados do funcionário
 *   onEdit       {function}  — callback ao clicar em editar
 *   onDelete     {function}  — callback ao clicar em excluir
 *   onToggle     {function}  — callback ao clicar em ativar/desativar
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2, Mail, CreditCard, Briefcase, DollarSign, Calendar } from "lucide-react";
import Avatar from "../Ui/Avatar";
import StatusBadge from "../Ui/StatusBadge";

const CARGO_LABEL = {
  ATENDENTE:  "Atendente",
  COZINHEIRO: "Cozinheiro",
  CAIXA:      "Caixa",
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-amber-400/70" />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider leading-none mb-0.5">
        {label}
      </p>
      <p className="text-slate-200 text-sm truncate">{value}</p>
    </div>
  </div>
);

const formatSalario = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatData = (value) =>
  new Date(value).toLocaleDateString("pt-BR");

const FuncionarioCard = ({ funcionario, onEdit, onDelete, onToggle }) => {
  const [expanded, setExpanded] = useState(false);

  const { user, cargo, salario, dataAdmissao, active } = funcionario;

  return (
    <div
      className={`
        relative bg-slate-900/60 border rounded-2xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${active
          ? "border-slate-700/50 hover:border-amber-500/20"
          : "border-slate-800/50 opacity-60 hover:opacity-80"
        }
      `}
    >
      {/* Linha decorativa superior */}
      <div className={`h-0.5 w-full ${active ? "bg-gradient-to-r from-amber-500/50 via-amber-500/20 to-transparent" : "bg-slate-800"}`} />

      {/* Corpo principal do crachá */}
      <div className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user.name}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {CARGO_LABEL[cargo] ?? cargo}
            </p>
            <div className="mt-2">
              <StatusBadge status={active ? "ativo" : "inativo"} />
            </div>
          </div>

          {/* Botão de expandir */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all duration-200 shrink-0"
            title={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Painel expandido */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/50">
          <div className="pt-1 divide-y divide-slate-800/50">
            <InfoRow icon={Mail}       label="E-mail"      value={user.email} />
            <InfoRow icon={CreditCard} label="CPF"         value={user.cpf} />
            <InfoRow icon={Briefcase}  label="Cargo"       value={CARGO_LABEL[cargo] ?? cargo} />
            <InfoRow icon={DollarSign} label="Salário"     value={formatSalario(salario)} />
            <InfoRow icon={Calendar}   label="Admissão"    value={formatData(dataAdmissao)} />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
            <button
              onClick={() => onToggle(funcionario)}
              className={`
                flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-all duration-200
                ${active
                  ? "text-slate-400 border-slate-700/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5"
                  : "text-slate-400 border-slate-700/50 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                }
              `}
            >
              {active ? "Desativar" : "Ativar"}
            </button>

            <button
              onClick={() => onEdit(funcionario)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium text-slate-400 border border-slate-700/50 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-200"
            >
              <Pencil size={12} />
              Editar
            </button>

            <button
              onClick={() => onDelete(funcionario)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium text-slate-400 border border-slate-700/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-200"
            >
              <Trash2 size={12} />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioCard;