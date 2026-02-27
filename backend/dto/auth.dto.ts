import { Role, User } from "@prisma/client";

// ─────────────────────────────────────────
// PAYLOAD DO ACCESS TOKEN
// ─────────────────────────────────────────

/**
 * Contrato explícito do que vai dentro do JWT.
 * Usa o enum Role do Prisma — garante em tempo de compilação
 * que só valores válidos ("GERENTE" | "ATENDENTE") entram no token.
 */
export interface AccessTokenPayloadDTO {
  id: number;
  email: string;
  role: Role;
  name: string;
}

/**
 * Converte um User do Prisma para o payload do token.
 * Centraliza a montagem — se novos campos forem necessários
 * no token no futuro, só muda aqui.
 */
export const toTokenPayload = (
  user: Pick<User, "id" | "email" | "role" | "name">
): AccessTokenPayloadDTO => ({
  id: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
});