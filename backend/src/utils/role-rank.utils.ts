const ROLE_RANK: Record<string, number> = {
  ADMIN: 100,
  ADMIN_RESTAURANTE: 80,
  GERENTE: 60,
  ATENDENTE: 20,
  COZINHEIRO: 20,
  CAIXA: 20,
};

export const getRoleRank = (roles: string[]): number =>
  Math.max(0, ...roles.map((r) => ROLE_RANK[r] ?? 0));
