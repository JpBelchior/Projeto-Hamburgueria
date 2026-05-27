// Hierarquia de roles — usada para controle de ações na UI
export const ROLE_RANK = {
  ADMIN: 100,
  ADMIN_RESTAURANTE: 80,
  GERENTE: 60,
  ATENDENTE: 20,
  COZINHEIRO: 20,
  CAIXA: 20,
};

export const getRoleRank = (roles = []) =>
  Math.max(0, ...roles.map((r) => ROLE_RANK[r] ?? 0));

// Mapeamentos de exibição de cargo
export const CARGO_LABEL = {
  ATENDENTE: "Atendente",
  COZINHEIRO: "Cozinheiro",
  CAIXA: "Caixa",
};

export const CARGO_OPTIONS = [
  { value: "ATENDENTE", label: "Atendente" },
  { value: "COZINHEIRO", label: "Cozinheiro" },
  { value: "CAIXA", label: "Caixa" },
];

// Filtros de status para listagens
export const STATUS_FILTERS = [
  { value: "todos",   label: "Todos"    },
  { value: "ativo",   label: "Ativos"   },
  { value: "inativo", label: "Inativos" },
];

// Configuração visual do StatusBadge
export const STATUS_CONFIG = {
  true:         { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  false:        { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
  ativo:        { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  inativo:      { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
  disponivel:   { label: "Disponível",   style: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  indisponivel: { label: "Indisponível", style: "bg-red-500/15 text-red-400 border-red-500/25" },
  ABERTO:       { label: "Aberto",       style: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  EM_PREPARO:   { label: "Em preparo",   style: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  FINALIZADO:   { label: "Finalizado",   style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  CANCELADO:    { label: "Cancelado",    style: "bg-red-500/15 text-red-400 border-red-500/25" },
};
