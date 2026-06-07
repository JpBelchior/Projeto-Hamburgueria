import { FormaPagamento, StatusPedido } from "@prisma/client";

export interface PedidoItemDTO {
  produtoId?:    number;
  comboId?:      number;
  quantidade:    number;
  precoUnitario: number;
  observacao?:   string;
}

export interface CreatePedidoDTO {
  nomeCliente?:    string;
  formaPagamento?: FormaPagamento;
  funcionarioId?:  number;
  itens:           PedidoItemDTO[];
}

export interface UpdatePedidoDTO {
  nomeCliente?:    string;
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
