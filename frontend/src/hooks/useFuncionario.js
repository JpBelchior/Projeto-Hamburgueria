import { useState, useEffect, useMemo } from "react";
import { funcionarioService } from "../services/Funcionario.service";

/**
 * useFuncionarios — gerencia estado e operações da página de funcionários
 *
 * Retorna:
 *   funcionarios     — lista filtrada (por busca e status)
 * stats              - lista funcionarios ativos e inativos
 *   isLoading        — carregamento inicial
 *   isSaving         — operação de criar/editar em andamento
 *   error            — mensagem de erro global
 *   search           — valor atual da busca
 *   setSearch        — atualiza busca
 *   filterStatus     — "todos" | "ativo" | "inativo"
 *   setFilterStatus  — atualiza filtro de status
 *   modalState       — { isOpen, mode: "create"|"edit", data }
 *   openCreate       — abre modal de criação
 *   openEdit         — abre modal de edição com dados
 *   closeModal       — fecha modal
 *   handleSubmit     — cria ou edita dependendo do modo
 *   handleToggle     — ativa/desativa funcionário
 *   handleDelete     — exclui funcionário permanentemente
 */

export const useFuncionarios = () => {
  // ─────────────────────────────────────────
  // Estado base
  // ─────────────────────────────────────────
  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Filtros
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    data: null,
  });

  // ─────────────────────────────────────────
  // Carga inicial
  // ─────────────────────────────────────────
  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const stats = useMemo(() => {
    const total = funcionarios.length;
    const ativos = funcionarios.filter((f) => f.active).length;
    const inativos = total - ativos;
    return { total, ativos, inativos };
  }, [funcionarios]);

  const fetchFuncionarios = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await funcionarioService.getAll();
      setFuncionarios(data);
    } catch {
      setError("Não foi possível carregar os funcionários.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Filtragem — derivada, sem estado extra
  // ─────────────────────────────────────────
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((f) => {
      const matchSearch = f.user.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "todos" ||
        (filterStatus === "ativo" && f.active) ||
        (filterStatus === "inativo" && !f.active);

      return matchSearch && matchStatus;
    });
  }, [funcionarios, search, filterStatus]);

  // ─────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────
  const openCreate = () =>
    setModalState({ isOpen: true, mode: "create", data: null });

  const openEdit = (funcionario) =>
    setModalState({ isOpen: true, mode: "edit", data: funcionario });

  const closeModal = () =>
    setModalState({ isOpen: false, mode: "create", data: null });

  // ─────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────
  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);
      setError("");

      if (modalState.mode === "create") {
        const novo = await funcionarioService.create(formData);
        // Busca o funcionário completo para ter a estrutura correta
        const completo = await funcionarioService.getById(novo.funcionario.id);
        setFuncionarios((prev) => [completo, ...prev]);
      } else {
        const atualizado = await funcionarioService.update(
          modalState.data.id,
          formData
        );
        setFuncionarios((prev) =>
          prev.map((f) => (f.id === atualizado.id ? atualizado : f))
        );
      }

      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar funcionário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (funcionario) => {
    try {
      setError("");
      const atualizado = await funcionarioService.toggleActive(funcionario.id);
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === atualizado.id ? atualizado : f))
      );
    } catch {
      setError("Erro ao alterar status do funcionário.");
    }
  };

  const handleDelete = async (funcionario) => {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir permanentemente "${funcionario.user.name}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    try {
      setError("");
      await funcionarioService.remove(funcionario.id);
      setFuncionarios((prev) => prev.filter((f) => f.id !== funcionario.id));
    } catch {
      setError("Erro ao excluir funcionário.");
    }
  };

  // ─────────────────────────────────────────
  // Retorno
  // ─────────────────────────────────────────
  return {
    funcionarios: funcionariosFiltrados,
    stats,
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
  };
};