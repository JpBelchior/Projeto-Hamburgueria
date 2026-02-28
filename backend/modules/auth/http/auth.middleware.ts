import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../infra/jwt.helper";
import { AccessTokenPayloadDTO } from "../application/dtos/auth.dto";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayloadDTO;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }
  try {
    req.user = verifyAccessToken(authHeader.split(" ")[1]);
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

export const requireGerente = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== Role.GERENTE) {
    res.status(403).json({ message: "Acesso restrito a gerentes." });
    return;
  }
  next();
};

export const requireAtendente = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== Role.ATENDENTE) {
    res.status(403).json({ message: "Acesso restrito a atendentes." });
    return;
  }
  next();
};