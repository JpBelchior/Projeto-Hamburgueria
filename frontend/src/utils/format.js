export const ACCENT = {
  from:   "#fbbf24",
  to:     "#f69e24",
  tint:   "rgba(245, 158, 11, 0.2)",
  text:   "#fbbf24",
  border: "rgba(245, 158, 11, 0.3)",
};

export const fmtBRL = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

export const fmtNum = (v) =>
  new Intl.NumberFormat("pt-BR").format(v);

export const fmtBRLShort = (valor) => {
  if (Math.abs(valor) >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(1)}M`;
  if (Math.abs(valor) >= 1_000)     return `R$ ${(valor / 1_000).toFixed(1)}k`;
  return fmtBRL(valor);
};

export const withAlpha = (hex, alpha) => {
  if (hex.startsWith("#")) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return hex.replace(/[\d.]+\)$/, `${alpha})`);
};

export const CAT_LABEL = {
  PRINCIPAL:      "Principal",
  ACOMPANHAMENTO: "Acomp.",
  BEBIDA:         "Bebida",
  SOBREMESA:      "Sobremesa",
  COMBO:          "Combo",
};

export const CAT_COLOR = {
  PRINCIPAL:      "#fbbf24",  
  ACOMPANHAMENTO: "#f97316", 
  BEBIDA:         "#38bdf8",  
  SOBREMESA:      "#584a80",  
  COMBO:          "#147c56",  
};

// ── Pedidos ─────────────────────────────────────────────────────────────────

export const STATUS_LABEL = {
  ABERTO:     "Aberto",
  EM_PREPARO: "Em Preparo",
  FINALIZADO: "Finalizado",
  CANCELADO:  "Cancelado",
};

export const STATUS_COLOR = {
  ABERTO:     "#38bdf8",
  EM_PREPARO: "#fbbf24",
  FINALIZADO: "#34d399",
  CANCELADO:  "#f87171",
};

export const PAGAMENTO_LABEL = {
  PIX:            "PIX",
  DINHEIRO:       "Dinheiro",
  CARTAO_CREDITO: "Crédito",
  CARTAO_DEBITO:  "Débito",
};

const SLA_MIN = 15;

export function getSLAStatus(pedido) {
  const ref = pedido.status === "EM_PREPARO" && pedido.tempoInicioPreparo
    ? new Date(pedido.tempoInicioPreparo)
    : new Date(pedido.createdAt);
  const ratio = (Date.now() - ref.getTime()) / 60_000 / SLA_MIN;
  if (ratio < 0.6)  return { color: "#34d399", label: "no prazo" };
  if (ratio < 0.85) return { color: "#fbbf24", label: "atenção"  };
  return { color: "#f87171", label: "atrasado" };
}

export function getSLAProgress(pedido) {
  const ref = pedido.status === "EM_PREPARO" && pedido.tempoInicioPreparo
    ? new Date(pedido.tempoInicioPreparo)
    : new Date(pedido.createdAt);
  const elapsed = (Date.now() - ref.getTime()) / 60_000;
  return Math.min(100, (elapsed / SLA_MIN) * 100);
}

export function fmtElapsedP(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function elapsedSeconds(from) {
  return Math.floor((Date.now() - new Date(from).getTime()) / 1000);
}
