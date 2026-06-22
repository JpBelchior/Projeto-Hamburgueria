export interface CreatePromocaoDTO {
  nome:          string;
  descricao?:    string;
  tempoPreparo?: number;
  comboIds?:     number[];
  produtoIds?:   number[];
}

export interface UpdatePromocaoDTO {
  nome?:          string;
  descricao?:     string;
  desconto?:      number | null;
  tempoPreparo?:  number | null;
  comboIds?:      number[];
  produtoIds?:    number[];
}
