export interface PromocaoItemDTO {
  id:         number;
  quantidade: number;
}

export interface CreatePromocaoDTO {
  nome:          string;
  desconto:      number;
  descricao?:    string;
  tempoPreparo?: number;
  combos?:       PromocaoItemDTO[];
  produtos?:     PromocaoItemDTO[];
}

export interface UpdatePromocaoDTO {
  nome?:          string;
  descricao?:     string;
  desconto?:      number | null;
  tempoPreparo?:  number | null;
  combos?:        PromocaoItemDTO[];
  produtos?:      PromocaoItemDTO[];
}
