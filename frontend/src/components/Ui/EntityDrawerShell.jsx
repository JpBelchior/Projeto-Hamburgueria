import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Drawer, { DrawerHeader, DrawerFooter, DrawerSkeleton, DrawerGradientTitle } from "./Drawer";
import ConfirmDialog from "./ConfirmDialog";

export default function EntityDrawerShell({
  // Estado vindo do hook
  item,
  loading, erro,
  salvando, erroSalvar,
  handleSalvar,
  handleDelete,

  // Config
  createMode,
  onClose,
  accentColor,

  // Textos
  createTitle,
  editTitle,
  headerBadge,

  // Create
  onCriar,
  onCriado,

  // Componentes
  Form,
  children,        // DetalheView já montado com os dados certos
  footerActions,   // JSX opcional (ex: botão Ativar/Desativar)

  // Confirmação de exclusão
  confirmTitle,
  confirmMessage,
}) {
  const [editMode,  setEditMode]  = useState(false);
  const [confirma,  setConfirma]  = useState(false);
  const [criando,   setCriando]   = useState(false);
  const [erroCriar, setErroCriar] = useState(null);

  const showForm = createMode || editMode;

  const handleCriar = async (data) => {
    setCriando(true);
    setErroCriar(null);
    try {
      const novo = await onCriar(data);
      onCriado?.(novo);
    } catch (e) {
      setErroCriar(e?.response?.data?.message ?? e?.message ?? "Erro ao criar.");
    } finally {
      setCriando(false);
    }
  };

  const handleSalvarEFechar = async (data) => {
    try {
      await handleSalvar(data);
      setEditMode(false);
    } catch {
      // erro exposto via erroSalvar
    }
  };

  const headerTitle = createMode
    ? <DrawerGradientTitle>{createTitle}</DrawerGradientTitle>
    : editMode
    ? <DrawerGradientTitle>{editTitle}</DrawerGradientTitle>
    : (item?.nome ?? "Carregando…");

  const headerActions = showForm ? (
    !createMode ? (
      <button
        onClick={() => setEditMode(false)}
        className="text-xs text-slate-500 hover:text-white px-2 transition-colors"
      >
        Ver detalhes
      </button>
    ) : null
  ) : item ? (
    <button
      onClick={() => setEditMode(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 border border-slate-700/50 hover:border-amber-500/30 transition-all"
    >
      <Pencil size={12} /> Editar
    </button>
  ) : null;

  return (
    <>
      <Drawer onClose={onClose}>
        <DrawerHeader
          title={headerTitle}
          badge={!showForm && item ? headerBadge : null}
          actions={headerActions}
          onClose={onClose}
          accentColor={accentColor}
        />

        {createMode ? (
          <div className="flex-1 overflow-y-auto p-5">
            {erroCriar && <p className="text-red-400 text-xs mb-3">{erroCriar}</p>}
            <Form
              initialData={null}
              onSubmit={handleCriar}
              onCancel={onClose}
              loading={criando}
            />
          </div>
        ) : loading ? (
          <DrawerSkeleton />
        ) : erro ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <p className="text-red-400 text-sm text-center">{erro}</p>
          </div>
        ) : item ? (
          editMode ? (
            <div className="flex-1 overflow-y-auto p-5">
              <Form
                initialData={item}
                onSubmit={handleSalvarEFechar}
                onCancel={() => setEditMode(false)}
                loading={salvando}
                erro={erroSalvar}
              />
            </div>
          ) : (
            <>
              {children}
              <DrawerFooter>
                <button
                  onClick={() => setConfirma(true)}
                  title={confirmTitle}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
                {footerActions && (
                  <div className="flex gap-2 flex-1 justify-end">{footerActions}</div>
                )}
              </DrawerFooter>
            </>
          )
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={confirma}
        onClose={() => setConfirma(false)}
        onConfirm={handleDelete}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Sim, excluir"
      />
    </>
  );
}
