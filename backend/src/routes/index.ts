import { Router } from "express";
import authRoutes from "./autentficacao/auth.routes";
import funcionarioRoutes from "./funcionario/funcionario.routes";
import restauranteRoutes from "./restaurante/restaurante.routes";
import restauranteProtectedRoutes from "./restaurante/restaurante.protected.routes";
import rolesRoutes from "./roles/roles.routes";
import pedidoRoutes from "./pedido/pedido.routes";
import produtoRoutes from "./produto/produto.routes";
import comboRoutes   from "./combo/combo.routes";
import gastoIngredienteRoutes from "./gasto_ingrediente/gasto_ingrediente.routes";
import gastoFuncionarioRoutes from "./gasto_funcionario/gasto_funcionario.routes";
import financeiroRoutes from "./financeiro/financeiro.routes";
import ingredienteRoutes from "./ingrediente/ingrediente.routes";

export const publicRoutes = Router();
publicRoutes.use("/auth", authRoutes);
publicRoutes.use("/roles", rolesRoutes);
publicRoutes.use("/restaurantes", restauranteRoutes);

export const protectedRoutes = Router();
protectedRoutes.use("/restaurantes",       restauranteProtectedRoutes);
protectedRoutes.use("/funcionarios",       funcionarioRoutes);
protectedRoutes.use("/produtos",           produtoRoutes);
protectedRoutes.use("/combos",             comboRoutes);
protectedRoutes.use("/pedidos",            pedidoRoutes);
protectedRoutes.use("/gasto-ingredientes",  gastoIngredienteRoutes);
protectedRoutes.use("/gasto-funcionarios",  gastoFuncionarioRoutes);
protectedRoutes.use("/financeiro",         financeiroRoutes);
protectedRoutes.use("/ingredientes",       ingredienteRoutes);
