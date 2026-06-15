import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useFuncionarios } from "../hooks/useFuncionario";
import HeaderBar from "../components/Ui/HeaderBar";
import Filter from "../components/Ui/Filter";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import EmptyState from "../components/Ui/EmptyState";
import ErrorAlert from "../components/Ui/ErrorAlert";
import FuncionarioCard from "../components/Funcionario/FuncionarioCard";
import FuncionarioDrawer from "../components/Funcionario/FuncionarioDrawer";
import { STATUS_FILTERS } from "../constants";

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
    refetch,
  } = useFuncionarios();

  return (
    <div>
      <HeaderBar
        title="Funcionários"
        subtitle="Gerencie a equipe e os níveis de acesso"
        onRefresh={refetch}
        refreshing={isLoading}
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

      {error && <ErrorAlert message={error} className="mb-6" />}

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
            <KpiSkeleton variant="card" />
            <KpiSkeleton variant="card" />
            <KpiSkeleton variant="card" />
            <KpiSkeleton variant="card" />
          </>
        ) : funcionarios.length === 0 ? (
          <EmptyState
            icon={Users}
            message={search ? `Nenhum funcionário encontrado para "${search}"` : "Nenhum funcionário cadastrado ainda"}
            actionLabel={search ? "Limpar busca" : undefined}
            onAction={search ? () => setSearch("") : undefined}
            className="col-span-2 py-20"
          />
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
