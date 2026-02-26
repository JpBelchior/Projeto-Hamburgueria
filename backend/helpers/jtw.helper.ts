import jwt from "jsonwebtoken";

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

export interface AccessTokenPayload {
  id: number;
  email: string;
  role: string;
  name: string;
}

// ─────────────────────────────────────────
// GERAÇÃO
// ─────────────────────────────────────────

/**
 * Gera o access token com validade curta.
 * Usado em toda requisição autenticada.
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "30m" });
};

/**
 * Gera o refresh token com validade longa .
 * Usa uma chave separada — um token não pode ser usado no lugar do outro.
 * Armazenado no banco e invalidado no logout.
 */
export const generateRefreshToken = (userId: number): string => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

// ─────────────────────────────────────────
// VERIFICAÇÃO
// ─────────────────────────────────────────

/**
 * Verifica e decodifica um access token.
 * Lança erro se inválido ou expirado.
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as AccessTokenPayload;
};

/**
 * Verifica e decodifica um refresh token.
 * Lança erro se inválido ou expirado.
 */
export const verifyRefreshToken = (token: string): { id: number } => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, secret) as { id: number };
};