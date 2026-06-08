import { useState } from "react";
import { STATUS_COLS, STATUS_BLOQUEADO } from "../constants";

export function useKanban(pedidos, updateStatus) {
  const [dragId,      setDragId]      = useState(null);
  const [dragOver,    setDragOver]    = useState(null);
  const [pendingDrop, setPendingDrop] = useState(null);

  const grouped = STATUS_COLS.reduce((acc, s) => {
    acc[s] = pedidos.filter((p) => p.status === s);
    return acc;
  }, {});

  const handleDrop = (novoStatus) => {
    if (!dragId) return;
    const ped = pedidos.find((p) => p.id === dragId);
    setDragId(null);
    setDragOver(null);
    if (!ped || ped.status === novoStatus) return;
    if (STATUS_BLOQUEADO.includes(ped.status)) return;
    if (novoStatus === "CANCELADO") {
      setPendingDrop({ id: dragId, numeroPedido: ped.numeroPedido, novoStatus });
      return;
    }
    updateStatus(dragId, novoStatus);
  };

  const confirmarDrop = async () => {
    if (!pendingDrop) return;
    await updateStatus(pendingDrop.id, pendingDrop.novoStatus);
    setPendingDrop(null);
  };

  return {
    grouped,
    dragId,    setDragId,
    dragOver,  setDragOver,
    pendingDrop, setPendingDrop,
    handleDrop,
    confirmarDrop,
  };
}
