export type StatusPagamento = 'PAGO' | 'RECUSADO' | 'PENDENTE'
export type StatusIngresso  = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'
export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO'

export interface Usuario {
  id: number
  nome: string
  cpf: string
  email: string
}

export interface Show {
  id: number
  nome: string
  data: string
  local: string
}

export interface Pedido {
  id: number
  usuario_id: number
  metodo_pagamento_id: number
  status_pagamento: StatusPagamento
  criado_em: string
}

export interface Ingresso {
  id: number
  id_show: number
  pedido_id: number | null
  preco: number
  status: StatusIngresso
}
