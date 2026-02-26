import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../helpers/jtw.helper"

export type JwtPayload = AccessTokenPayload;

// Extende o Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

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

export const requireManager = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "GERENTE") {
    res.status(403).json({ message: "Acesso restrito a gerentes." });
    return;
  }
  next();
};