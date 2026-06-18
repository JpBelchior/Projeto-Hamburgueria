export const calcDelta = (atual, anterior) => {
  if (!anterior || anterior === 0) return undefined;
  return ((atual - anterior) / anterior) * 100;
};

/**
 * Transforma o bloco `financeiro` retornado pela API em valores
 * prontos para exibição no FinanceiroCard.
 */
export function computeFinanceiro(financeiro) {
  if (!financeiro) return null;

  const { receita, custoIngredientes, custoFuncionarios, custoTotal, margem } = financeiro;

  const ingrPct        = custoTotal.valor > 0 ? (custoIngredientes.valor / custoTotal.valor) * 100 : 50;
  const funcPct        = 100 - ingrPct;
  const margemPct      = receita.valor    > 0 ? (margem.valor / receita.valor)   * 100 : 0;
  const custoPctReceita = receita.valor   > 0 ? (custoTotal.valor / receita.valor) * 100 : 0;

  return {
    receita,
    custoTotal,
    margem:       { ...margem,            pct: margemPct },
    ingredientes: { ...custoIngredientes, pct: ingrPct   },
    funcionarios: { ...custoFuncionarios, pct: funcPct   },
    custoPctReceita,
  };
}
