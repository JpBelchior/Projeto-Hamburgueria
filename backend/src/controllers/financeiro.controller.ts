import { Request, Response } from "express";
import * as FinanceiroService from "../services/financeiro.service";

export const getMetricas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipo = (req.query.tipo as string) ?? "mensal";
    const ano  = Number(req.query.ano)  || new Date().getFullYear();
    const mes  = Number(req.query.mes)  || (new Date().getMonth() + 1);

    if (!["mensal", "anual"].includes(tipo)) {
      res.status(400).json({ message: "tipo inválido. Use: mensal ou anual." });
      return;
    }
    if (tipo === "mensal" && (mes < 1 || mes > 12)) {
      res.status(400).json({ message: "mes deve ser entre 1 e 12." });
      return;
    }

    const dados = await FinanceiroService.getMetricasFinanceiro(
      tipo as "mensal" | "anual",
      mes,
      ano,
    );
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar métricas financeiras:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
