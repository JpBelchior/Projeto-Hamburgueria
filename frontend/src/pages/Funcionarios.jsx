import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useFuncionarios } from "../hooks/useFuncionario";
import HeaderBar from "../components/Ui/HeaderBar";
import Filter from "../components/Ui/Filter";
import FuncionarioCard from "../components/Funcionario/FuncionarioCard";
import FuncionarioDrawer from "../components/Funcionario/FuncionarioDrawer";
import { STATUS_FILTERS } from "../constants";

const EmptyState = ({ search, onClear }) => (
  <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mb-4">
      <Users size={24} className="text-slate-600" />
    </div>
    <p className="text-slate-400 font-medium text-sm">
      {search
        ? `Nenhum funcionário encontrado para "${search}"`
        : "Nenhum funcionário cadastrado ainda"}
    </p>
    {search && (
      <button
        onClick={onClear}
        className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
      >
        Limpar busca
      </button>
    )}
  </div>
);

const CardSkeleton = () => (
  <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-0.5 w-full bg-slate-800" />
    <div className="p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-800 rounded w-2/3" />
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-5 bg-slate-800 rounded-full w-16 mt-2" />
      </div>
    </div>
  </div>
);

// null = fechado, 'new' = criar, number = ver/editar
const Funcionarios = () => {
  const [drawerState, setDrawerState] = useState(null);

  const {
    funcionarios,
    setFuncionarios,
    stats = { total: 0, ativos: 0, inativos: 0 },
    isLoading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
  } = useFuncionarios();

  return (
    <div>
      <HeaderBar
        title="Funcionários"
        subtitle="Gerencie a equipe e os níveis de acesso"
      />

      {!isLoading && (
        <div className="flex items-center gap-1.5 mb-6 text-sm">
          <span className="text-white font-semibold">{stats.total}</span>
          <span className="text-slate-500">
            {stats.total === 1 ? "funcionário" : "funcionários"}
          </span>
          <span className="text-slate-700 mx-1">·</span>
          <span className="text-emerald-400 font-medium">{stats.ativos} ativos</span>
          <span className="text-slate-700 mx-1">·</span>
          <span className="text-slate-500 font-medium">{stats.inativos} inativos</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      <div className="mb-6">
        <Filter
          search={{ value: search, onChange: setSearch, placeholder: "Buscar funcionário pelo nome..." }}
          tabs={[{ options: STATUS_FILTERS, value: filterStatus, onChange: setFilterStatus }]}
          action={{ label: "Novo funcionário", icon: UserPlus, onClick: () => setDrawerState("new") }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : funcionarios.length === 0 ? (
          <EmptyState search={search} onClear={() => setSearch("")} />
        ) : (
          funcionarios.map((funcionario) => (
            <FuncionarioCard
              key={funcionario.id}
              funcionario={funcionario}
              onClick={() => setDrawerState(funcionario.id)}
            />
          ))
        )}
      </div>

      {drawerState !== null && (
        <FuncionarioDrawer
          funcionarioId={drawerState === "new" ? null : drawerState}
          createMode={drawerState === "new"}
          onClose={() => setDrawerState(null)}
          onFuncionarioCriado={(novo) => {
            setFuncionarios((prev) => [novo, ...prev]);
            setDrawerState(null);
          }}
          onFuncionarioAtualizado={(atualizado) =>
            setFuncionarios((prev) =>
              prev.map((f) => (f.id === atualizado.id ? atualizado : f))
            )
          }
          onFuncionarioDeletado={(id) => {
            setFuncionarios((prev) => prev.filter((f) => f.id !== id));
            setDrawerState(null);
          }}
        />
      )}
    </div>
  );
};

export default Funcionarios;
