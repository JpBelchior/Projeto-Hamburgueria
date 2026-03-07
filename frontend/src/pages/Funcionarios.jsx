/**
 * Funcionarios — página de gerenciamento de funcionários (GERENTE)
 *
 * Orquestra:
 *   useFuncionarios  → toda a lógica de estado e operações
 *   PageHeader       → título + separador
 *   SearchBar        → busca por nome
 *   StatusBadge      → filtro por status
 *   FuncionarioCard  → crachá com expansão
 *   Modal            → wrapper do formulário
 *   FuncionarioForm  → formulário de criar/editar
 */

import { UserPlus, Users } from "lucide-react";
import { useFuncionarios } from "../hooks/useFuncionario";
import PageHeader from "../components/Ui/PageHeader";
import SearchBar from "../components/Ui/SearchBar";
import Modal from "../components/Ui/Modal";
import Button from "../components/Ui/Button";
import FuncionarioCard from "../components/Funcionario/FuncionarioCard";
import FuncionarioForm from "../components/Funcionario/FuncionarioForm";

// ─────────────────────────────────────────
// Sub-componente — filtro de status
// ─────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "todos",   label: "Todos"   },
  { value: "ativo",   label: "Ativos"  },
  { value: "inativo", label: "Inativos"},
];

const FilterStatus = ({ value, onChange }) => (
  <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1">
    {STATUS_FILTERS.map((f) => (
      <button
        key={f.value}
        onClick={() => onChange(f.value)}
        className={`
          px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
          ${value === f.value
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : "text-slate-400 hover:text-white border border-transparent"
          }
        `}
      >
        {f.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────
// Sub-componente — estado vazio
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Sub-componente — skeleton de loading
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────

const Funcionarios = () => {
  const {
    funcionarios,
    stats = { total: 0, ativos: 0, inativos: 0 },
    isLoading,
    isSaving,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    modalState,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleToggle,
    handleDelete,
  } = useFuncionarios();

  return (
    <div>
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie a equipe e os níveis de acesso"
      />

      {/* Contador */}
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

      {/* Erro global */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar funcionário pelo nome..."
          />
        </div>

        <FilterStatus value={filterStatus} onChange={setFilterStatus} />

        <Button icon={UserPlus} onClick={openCreate}>
          Novo funcionário
        </Button>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>

      {/* Modal — criar / editar */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === "create" ? "Novo funcionário" : "Editar funcionário"}
        size="lg"
      >
        <FuncionarioForm
          initialData={modalState.data}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
};

export default Funcionarios;