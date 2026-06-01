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
