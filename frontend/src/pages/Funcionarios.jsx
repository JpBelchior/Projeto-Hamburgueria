import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useFuncionarios } from "../hooks/useFuncionario";
import { useFuncionariosMetricas } from "../hooks/useFuncionariosMetricas";
import HeaderBar from "../components/Ui/HeaderBar";
import Filter from "../components/Ui/Filter";
import KpiSkeleton from "../components/Ui/KpiSkeleton";
import EmptyState from "../components/Ui/EmptyState";
import ErrorAlert from "../components/Ui/ErrorAlert";
import FuncionariosKpis from "../components/Funcionario/FuncionariosKpis";
import FuncionarioCard from "../components/Funcionario/FuncionarioCard";
import FuncionarioDrawer from "../components/Funcionario/FuncionarioDrawer";
import { STATUS_FILTERS } from "../constants";

// null = fechado, 'new' = criar, number = ver/editar
const Funcionarios = () => {
  const [drawerState, setDrawerState] = useState(null);

  const {
    funcionarios,
    setFuncionarios,
    isLoading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    refetch,
  } = useFuncionarios();

  const { dados: metricas, loading: metricasLoading, refetch: refetchMetricas } = useFuncionariosMetricas();

  const handleRefresh = () => { refetch(); refetchMetricas(); };

  return (
    <div className="flex flex-col gap-5">
      <HeaderBar
        title="Funcionários"
        subtitle="Gerencie a equipe e os níveis de acesso"
        onRefresh={handleRefresh}
        refreshing={isLoading || metricasLoading}
      />

      {metricasLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} variant="compact" />)}
        </div>
      ) : (
        metricas && <FuncionariosKpis metricas={metricas} />
      )}

      {error && <ErrorAlert message={error} />}

      <div>
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
