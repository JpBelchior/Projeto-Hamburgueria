import { FormaPagamento, StatusPedido } from "@prisma/client";

export interface PedidoItemDTO {
  produtoId?:    number;
  comboId?:      number;
  promocaoId?:   number;
  quantidade:    number;
  precoUnitario: number;
  observacao?:   string;
}

export interface CreatePedidoDTO {
  nomeCliente?:    string;
  mesa?:           number;
  formaPagamento?: FormaPagamento;
  itens:           PedidoItemDTO[];
}

export interface UpdatePedidoDTO {
  nomeCliente?:    string;
  mesa?:           number;
  formaPagamento?: FormaPagamento;
  itens?:          PedidoItemDTO[];
}

export interface UpdateStatusDTO {
  status: StatusPedido;
}

export interface ListPedidosDTO {
  periodo?:        string;
  status?:         StatusPedido;
  formaPagamento?: FormaPagamento;
}
