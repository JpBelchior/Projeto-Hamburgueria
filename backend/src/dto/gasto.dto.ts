export type TipoGasto = "INGREDIENTE" | "FUNCIONARIO" | "GENERICO";

export interface CreateGastoDTO {
  tipo:            TipoGasto;
  nome:            string;
  valor:           number;
  descricao?:      string;
  mes:             number;
  ano:             number;
  ingredientes?:   { id: number; quantidade: number }[];
  funcionarioIds?: number[];
}

export interface UpdateGastoDTO {
  nome?:           string;
  valor?:          number;
  descricao?:      string;
  ingredientes?:   { id: number; quantidade: number }[];
  funcionarioIds?: number[];
}

export interface ListGastosDTO {
  tipo?: TipoGasto;
  mes?:  number;
  ano?:  number;
}
