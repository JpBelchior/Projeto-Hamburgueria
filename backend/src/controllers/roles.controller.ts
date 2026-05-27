import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      where: { active: true },
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });
    res.json(roles);
  } catch (error) {
    console.error("Erro ao buscar roles:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
