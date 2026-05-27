import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { AccessTokenPayloadDTO } from "../dto/auth.dto";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayloadDTO;
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
