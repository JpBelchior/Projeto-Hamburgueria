import { useGasto } from "./useGasto";
import { gastoIngredienteService } from "../services/gasto.service";

export const useGastoIngrediente = (mes, ano, onAlterado) => {
  const gasto = useGasto(gastoIngredienteService, mes, ano, onAlterado);
  return {
    ...gasto,
    add:  (nome, valor, descricao, ingredienteIds) => gasto.add(nome, valor, descricao, { ingredienteIds }),
    edit: (id, nome, valor, descricao, ingredienteIds) => gasto.edit(id, nome, valor, descricao, { ingredienteIds }),
  };
};
