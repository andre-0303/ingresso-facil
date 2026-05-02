import { z } from 'zod'

export const criarPedidoSchema = z.object({
  usuario_id: z.number().int().positive(),
  show_id: z.number().int().positive(),
  quantidade: z.number().int().min(1).max(5, 'máximo 5 ingressos por pedido'),
  metodo_pagamento_id: z.number().int().positive(),
})

export const confirmarPagamentoSchema = z.object({
  aprovado: z.boolean(),
})

export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>
export type ConfirmarPagamentoInput = z.infer<typeof confirmarPagamentoSchema>
