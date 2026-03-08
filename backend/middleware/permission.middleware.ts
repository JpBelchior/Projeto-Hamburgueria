// permission.middleware.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRoles = req.user?.roles ?? [];

    // ADMIN → bypass
    if (userRoles.includes("ADMIN")) {
      next();
      return;
    }

    try {
      const permission = await prisma.rolePermission.findFirst({
        where: {
          role: {
            name: { in: userRoles },
          },
          permission: {
            action,
            resource: { name: resource },
          },
        },
      });

      if (!permission) {
        res.status(403).json({ message: "Acesso não autorizado." });
        return;
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  };
};