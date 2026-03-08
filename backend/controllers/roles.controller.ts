// src/roles/roles.controller.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response): Promise<void> => {
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