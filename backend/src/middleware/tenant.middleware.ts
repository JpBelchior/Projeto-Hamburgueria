import { Request, Response, NextFunction } from "express";

export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.roles.includes("ADMIN")) {
    next();
    return;
  }

  if (!req.user?.restauranteId) {
    res.status(403).json({ message: "Usuário não vinculado a um restaurante." });
    return;
  }

  next();
};
