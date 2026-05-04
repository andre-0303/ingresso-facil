export type StatusPagamento = 'PAGO' | 'RECUSADO' | 'PENDENTE'
export type StatusIngresso = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'

export interface Show {
  id: number
  nome: string
  data: string
  local: string
  ingressos_disponiveis?: number
}

export interface Usuario {
  id: number
  nome: string
  cpf: string
  email: string
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

export const METODOS_PAGAMENTO = [
  { id: 1, label: 'Cartão de Crédito', icon: '💳' },
  { id: 2, label: 'Cartão de Débito', icon: '🏧' },
  { id: 3, label: 'PIX', icon: '⚡' },
  { id: 4, label: 'Boleto', icon: '📄' },
]
