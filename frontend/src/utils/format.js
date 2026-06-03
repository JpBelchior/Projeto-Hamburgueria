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
};

export const CAT_COLOR = {
  PRINCIPAL:      "#fbbf24",  // amber-400 — coincide com ACCENT
  ACOMPANHAMENTO: "#f97316",  // orange-500 — quente, vizinho do âmbar
  BEBIDA:         "#38bdf8",  // sky-400 — fresco, contraste frio
  SOBREMESA:      "#a78bfa",  // violet-400 — suave, diferenciado
};
