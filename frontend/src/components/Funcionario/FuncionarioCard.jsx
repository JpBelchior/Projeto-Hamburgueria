import { Clock } from "lucide-react";
import Avatar from "../Ui/Avatar";
import StatusBadge from "../Ui/StatusBadge";
import { tempoNaEmpresa } from "../../utils/Date.utils";
import { CARGO_LABEL } from "../../constants";

const FuncionarioCard = ({ funcionario, onClick }) => {
  const { user, dataAdmissao, active } = funcionario;
  const primaryRole = user.roles?.[0]?.role?.name ?? "";
  const roleLabel = primaryRole
    ? primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase()
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-slate-900/60 border rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-in-out
        ${active
          ? "border-slate-700/50 hover:border-amber-500/20"
          : "border-slate-800/50 opacity-60 hover:opacity-80"
        }
      `}
    >
      <div className={`h-0.5 w-full ${active ? "bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" : "bg-slate-800"}`} />

      <div className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{roleLabel} - {CARGO_LABEL[funcionario.cargo] ?? funcionario.cargo}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={active ? "ativo" : "inativo"} />
              <span className="flex items-center gap-1 text-slate-500 text-[12px]">
                <Clock size={10} />
                Tempo de serviço: {tempoNaEmpresa(dataAdmissao)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioCard;
