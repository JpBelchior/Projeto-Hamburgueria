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

export const CARGO_COLOR = {
  ATENDENTE:  "#38bdf8",  // sky   — STATUS_COLOR.ABERTO
  COZINHEIRO: "#fbbf24",  // amber — ACCENT / CAT_COLOR.PRINCIPAL
  CAIXA:      "#34d399",  // green — STATUS_COLOR.FINALIZADO
};

export const CARGO_OPTIONS = [
  { value: "ATENDENTE", label: "Atendente" },
  { value: "COZINHEIRO", label: "Cozinheiro" },
  { value: "CAIXA", label: "Caixa" },
];

// Períodos de análise (compartilhado entre Dashboard e Pedidos)
export const PERIODOS = [
  { value: "hoje",   label: "Hoje",    vsLabel: "vs ontem",        vsHint: "que ontem"           },
  { value: "7dias",  label: "7 dias",  vsLabel: "vs sem. passada", vsHint: "que a semana passada" },
  { value: "30dias", label: "30 dias", vsLabel: "vs mês passado",  vsHint: "que o mês passado"   },
  { value: "anual",  label: "Anual",   vsLabel: "vs ano passado",  vsHint: "que o ano passado"   },
];

// Colunas de status do kanban de pedidos
export const STATUS_COLS = ["ABERTO", "EM_PREPARO", "FINALIZADO", "CANCELADO"];

// Status que não permitem mais alterações
export const STATUS_BLOQUEADO = ["FINALIZADO", "CANCELADO"];

// Progressão de status de pedido
export const PROXIMO_STATUS = {
  ABERTO:     "EM_PREPARO",
  EM_PREPARO: "FINALIZADO",
};
export const PROXIMO_LABEL = {
  ABERTO:     "Iniciar Preparo",
  EM_PREPARO: "Finalizar",
};

// Formas de pagamento (sem opção vazia — cada contexto adiciona a sua)
export const FORMAS_PAGAMENTO = [
  { value: "PIX",            label: "PIX"            },
  { value: "DINHEIRO",       label: "Dinheiro"       },
  { value: "CARTAO_CREDITO", label: "Cartão Crédito" },
  { value: "CARTAO_DEBITO",  label: "Cartão Débito"  },
];

// Anos disponíveis nos seletores (ano atual e 4 anteriores)
export const ANOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Classe padrão dos selects de mês/ano no header
export const SELECT_CLASS =
  "bg-slate-800/70 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50";

// Meses do ano
export const MESES = [
  { value: 1,  label: "Janeiro"   },
  { value: 2,  label: "Fevereiro" },
  { value: 3,  label: "Março"     },
  { value: 4,  label: "Abril"     },
  { value: 5,  label: "Maio"      },
  { value: 6,  label: "Junho"     },
  { value: 7,  label: "Julho"     },
  { value: 8,  label: "Agosto"    },
  { value: 9,  label: "Setembro"  },
  { value: 10, label: "Outubro"   },
  { value: 11, label: "Novembro"  },
  { value: 12, label: "Dezembro"  },
];

// Filtros de status para listagens
export const STATUS_FILTERS = [
  { value: "todos",   label: "Todos"    },
  { value: "ativo",   label: "Ativos"   },
  { value: "inativo", label: "Inativos" },
];

// Unidades de medida de ingredientes
export const UNIDADE_LABEL = {
  KG:      "Quilos",
  G:       "Gramas",
  LITRO:   "Litros",
  ML:      "Militros",
  UNIDADE: "Unidades",
};

export const UNIDADE_OPTIONS = [
  { value: "KG",      label: "kg — Quilograma" },
  { value: "G",       label: "g — Grama"       },
  { value: "LITRO",   label: "L — Litro"       },
  { value: "ML",      label: "ml — Mililitro"  },
  { value: "UNIDADE", label: "un — Unidade"    },
];

// Categorias de produto
export const CATEGORIAS = ["PRINCIPAL", "ACOMPANHAMENTO", "BEBIDA", "SOBREMESA"];

export const CATEGORIA_OPTIONS = [
  { value: "PRINCIPAL",      label: "Principal" },
  { value: "ACOMPANHAMENTO", label: "Acompanhamento" },
  { value: "BEBIDA",         label: "Bebida" },
  { value: "SOBREMESA",      label: "Sobremesa" },
];

// Configuração visual do StatusBadge
export const STATUS_CONFIG = {
  true:         { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  false:        { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
  ativo:        { label: "Ativo",        style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  inativo:      { label: "Inativo",      style: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
  ABERTO:       { label: "Aberto",       style: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  EM_PREPARO:   { label: "Em preparo",   style: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  FINALIZADO:   { label: "Finalizado",   style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  CANCELADO:    { label: "Cancelado",    style: "bg-red-500/15 text-red-400 border-red-500/25" },
};
