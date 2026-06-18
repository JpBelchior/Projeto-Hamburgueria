import { useGasto } from "./useGasto";
import { gastoFuncionarioService } from "../services/gasto.service";

export const useGastoFuncionario = (mes, ano, onAlterado) => {
  const gasto = useGasto(gastoFuncionarioService, mes, ano, onAlterado);
  return {
    ...gasto,
    add:  (nome, valor, descricao, funcionarioIds) => gasto.add(nome, valor, descricao, { funcionarioIds }),
    edit: (id, nome, valor, descricao, funcionarioIds) => gasto.edit(id, nome, valor, descricao, { funcionarioIds }),
  };
};
