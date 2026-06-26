import prisma from "../config/prisma";

function ownershipError(entity: string) {
  return Object.assign(new Error(`${entity} inválido para este restaurante.`), { statusCode: 400 });
}

export async function validateIngredientesDoRestaurante(ids: number[], restauranteId: number) {
  if (!ids.length) return;
  const found = await prisma.ingrediente.findMany({ where: { id: { in: ids }, restauranteId }, select: { id: true } });
  if (found.length !== ids.length) throw ownershipError("Ingrediente");
}

export async function validateFuncionariosDoRestaurante(ids: number[], restauranteId: number) {
  if (!ids.length) return;
  const found = await prisma.funcionario.findMany({ where: { id: { in: ids }, restauranteId }, select: { id: true } });
  if (found.length !== ids.length) throw ownershipError("Funcionário");
}

export async function validateProdutosDoRestaurante(ids: number[], restauranteId: number) {
  if (!ids.length) return;
  const found = await prisma.produto.findMany({ where: { id: { in: ids }, restauranteId }, select: { id: true } });
  if (found.length !== ids.length) throw ownershipError("Produto");
}

export async function validateCombosDoRestaurante(ids: number[], restauranteId: number) {
  if (!ids.length) return;
  const found = await prisma.combo.findMany({ where: { id: { in: ids }, restauranteId }, select: { id: true } });
  if (found.length !== ids.length) throw ownershipError("Combo");
}

export async function validatePromocoesDoRestaurante(ids: number[], restauranteId: number) {
  if (!ids.length) return;
  const found = await prisma.promocao.findMany({ where: { id: { in: ids }, restauranteId }, select: { id: true } });
  if (found.length !== ids.length) throw ownershipError("Promoção");
}
