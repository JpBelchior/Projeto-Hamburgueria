import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../helpers/jtw.helper";
import { AccessTokenPayloadDTO } from "../dto/auth.dto";
import { Role } from "@prisma/client";

// ─────────────────────────────────────────
// TIPAGEM GLOBAL DO REQUEST
// ─────────────────────────────────────────

/**
 * Estende o Request do Express para incluir o usuário autenticado.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayloadDTO;
    }
  }
}

// AUTENTICAÇÃO

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

// ─────────────────────────────────────────
// AUTORIZAÇÃO POR ROLE
// ─────────────────────────────────────────

 // Restringe rota apenas para GERENTE.
 
export const requireGerente = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== Role.GERENTE) {
    res.status(403).json({ message: "Acesso restrito a gerentes." });
    return;
  }
  next();
};

/**
 * Restringe rota apenas para ATENDENTE.
 */
export const requireAtendente = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== Role.ATENDENTE) {
    res.status(403).json({ message: "Acesso restrito a atendentes." });
    return;
  }
  next();
};