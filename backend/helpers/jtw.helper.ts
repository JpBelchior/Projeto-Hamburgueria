import jwt from "jsonwebtoken";
import { AccessTokenPayloadDTO } from "../dto/auth.dto";

// ─────────────────────────────────────────
// GERAÇÃO
// ─────────────────────────────────────────

/**
 * Gera o access token com validade curta.
 * Recebe AccessTokenPayloadDTO
 */
export const generateAccessToken = (payload: AccessTokenPayloadDTO): string => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(payload, secret, { expiresIn: "30m" });
};

/**
 * Gera o refresh token com validade longa.
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
 * Retorna AccessTokenPayloadDTO
 */
export const verifyAccessToken = (token: string): AccessTokenPayloadDTO => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as AccessTokenPayloadDTO;
};

/**
 * Verifica e decodifica um refresh token.
 * Lança erro se inválido ou expirado.
 */
export const verifyRefreshToken = (token: string): { id: number } => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, secret) as { id: number };
};