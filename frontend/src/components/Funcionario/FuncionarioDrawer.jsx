import { useState, useEffect } from "react";
import { Pencil, Trash2, Power } from "lucide-react";
import Drawer, { DrawerHeader, DrawerFooter, DrawerSection, DrawerRow } from "../Ui/Drawer";
import Avatar from "../Ui/Avatar";
import Button from "../Ui/Button";
import ConfirmDialog from "../Ui/ConfirmDialog";
import StatusBadge from "../Ui/StatusBadge";
import FuncionarioForm from "./FuncionarioForm";
import { funcionarioService } from "../../services/funcionario.service";
import { formatData, formatMoeda, formatTelefone, tempoNaEmpresa } from "../../utils/Date.utils";
import { getRoleRank, CARGO_LABEL } from "../../constants";
import { ACCENT } from "../../utils/format";
import useAuthStore from "../../store/useAuthStore";

function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-3/4" />
          <div className="h-2 bg-slate-800 rounded w-1/2" />
          <div className="h-5 bg-slate-800 rounded-full w-16" />
        </div>
      </div>
      <div className="h-px bg-slate-800" />
      <div className="space-y-3">
        <div className="h-2.5 bg-slate-800 rounded w-1/4" />
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800 rounded" />)}
      </div>
      <div className="h-px bg-slate-800" />
      <div className="space-y-3">
        <div className="h-2.5 bg-slate-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-800 rounded" />)}
      </div>
    </div>
  );
}

export default function FuncionarioDrawer({
  funcionarioId,
  createMode = false,
  onClose,
  onFuncionarioCriado,
  onFuncionarioAtualizado,
  onFuncionarioDeletado,
}) {
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(!createMode);
  const [erro, setErro] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [confirmaDelete, setConfirmaDelete] = useState(false);

  const loggedUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (createMode || !funcionarioId) return;
    setLoading(true);
    setErro(null);
    setEditMode(false);
    funcionarioService
      .getById(funcionarioId)
      .then(setFuncionario)
      .catch((e) => setErro(e?.response?.data?.message ?? e?.message ?? "Erro ao carregar funcionário"))
      .finally(() => setLoading(false));
  }, [funcionarioId, createMode]);

  const loggedRank = getRoleRank(loggedUser?.roles ?? []);
  const targetRank = funcionario
    ? getRoleRank(funcionario.user.roles?.map((ur) => ur.role?.name ?? ur) ?? [])
    : Infinity;
  const canAct = loggedRank > targetRank;

  const primaryRole = funcionario?.user.roles?.[0]?.role?.name ?? "";
  const roleLabel = primaryRole
    ? primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase()
    : "";

  const handleCriar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      const novo = await funcionarioService.create(data);
      const completo = await funcionarioService.getById(novo.funcionario.id);
      onFuncionarioCriado?.(completo);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao criar funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      const atualizado = await funcionarioService.update(funcionarioId, data);
      setFuncionario(atualizado);
      onFuncionarioAtualizado?.(atualizado);
      setEditMode(false);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao salvar funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async () => {
    if (!funcionario) return;
    const novoAtivo = !funcionario.active;
    setFuncionario((f) => ({ ...f, active: novoAtivo }));
    try {
      const atualizado = await funcionarioService.toggleActive(funcionarioId);
      setFuncionario(atualizado);
      onFuncionarioAtualizado?.(atualizado);
    } catch {
      setFuncionario((f) => ({ ...f, active: !novoAtivo }));
    }
  };

  const handleDelete = async () => {
    await funcionarioService.remove(funcionarioId);
    onFuncionarioDeletado?.(funcionarioId);
  };

  // ── Header ───────────────────────────────────────────────────────────────────

  const gradientTitle = (text) => (
    <h2
      className="text-base font-bold bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}
    >
      {text}
    </h2>
  );

  const showForm = createMode || editMode;

  const headerTitle = createMode
    ? gradientTitle("Novo Funcionário")
    : editMode
    ? gradientTitle("Editar Funcionário")
    : (funcionario?.user.name ?? "Carregando…");

  const headerBadge = !showForm && funcionario ? (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 bg-amber-500/15 text-amber-400 border border-amber-500/25">
      {roleLabel}
    </span>
  ) : null;

  const headerActions = showForm ? (
    !createMode ? (
      <button
        onClick={() => { setEditMode(false); setErroSalvar(null); }}
        className="text-xs text-slate-500 hover:text-white px-2 transition-colors"
      >
        Ver detalhes
      </button>
    ) : null
  ) : canAct && funcionario ? (
    <button
      onClick={() => setEditMode(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 border border-slate-700/50 hover:border-amber-500/30 transition-all"
    >
      <Pencil size={12} /> Editar
    </button>
  ) : null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Drawer onClose={onClose}>
        <DrawerHeader
          title={headerTitle}
          badge={headerBadge}
          actions={headerActions}
          onClose={onClose}
          accentColor={ACCENT.from}
        />

        {loading ? (
          <LoadingSkeleton />
        ) : erro ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <p className="text-red-400 text-sm text-center">{erro}</p>
          </div>
        ) : showForm ? (
          <div className="flex-1 overflow-y-auto p-5">
            {erroSalvar && <p className="text-red-400 text-xs mb-3">{erroSalvar}</p>}
            <FuncionarioForm
              initialData={createMode ? null : funcionario}
              onSubmit={createMode ? handleCriar : handleSalvar}
              onCancel={createMode ? onClose : () => { setEditMode(false); setErroSalvar(null); }}
              isLoading={salvando}
            />
          </div>
        ) : funcionario ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

              <div className="flex items-start gap-4">
                <Avatar name={funcionario.user.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{funcionario.user.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{roleLabel}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={funcionario.active ? "ativo" : "inativo"} />
                    <span className="text-slate-500 text-xs">
                      {tempoNaEmpresa(funcionario.dataAdmissao)} na empresa
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <DrawerSection>Dados Pessoais</DrawerSection>
                <div className="flex flex-col gap-3">
                  <DrawerRow label="E-mail" value={funcionario.user.email} />
                  <DrawerRow label="CPF" value={funcionario.user.cpf} />
                  <DrawerRow label="Telefone" value={formatTelefone(funcionario.user.telefone)} />
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <DrawerSection>Dados Profissionais</DrawerSection>
                <div className="flex flex-col gap-3">
                  <DrawerRow label="Cargo" value={CARGO_LABEL[funcionario.cargo] ?? funcionario.cargo} />
                  <DrawerRow label="Salário" value={formatMoeda(funcionario.salario)} highlight />
                  <DrawerRow label="Admissão" value={formatData(funcionario.dataAdmissao)} />
                </div>
              </div>

            </div>

            {canAct && (
              <DrawerFooter>
                <button
                  onClick={() => setConfirmaDelete(true)}
                  title="Excluir funcionário"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex gap-2 flex-1 justify-end">
                  <Button variant="ghost" size="sm" icon={Power} onClick={handleToggleAtivo}>
                    {funcionario.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </DrawerFooter>
            )}
          </>
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={confirmaDelete}
        onClose={() => setConfirmaDelete(false)}
        onConfirm={handleDelete}
        title="Excluir funcionário"
        message={`Tem certeza que deseja excluir permanentemente "${funcionario?.user.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
