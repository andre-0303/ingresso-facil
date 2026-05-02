import type { Request, Response } from 'express'
import { criarPedidoSchema, confirmarPagamentoSchema } from './pedido.schema.js'
import * as pedidoService from './pedido.service.js'
import { AppError } from '../../shared/errors/AppError.js'

export async function criarPedido(req: Request, res: Response) {
  const result = criarPedidoSchema.safeParse(req.body)
  if (!result.success) throw new AppError(result.error.issues[0].message)

  const pedido = await pedidoService.criarPedido(result.data)
  res.status(201).json(pedido)
}

export async function buscarPedido(req: Request, res: Response) {
  const pedido = await pedidoService.buscarPedidoPorId(Number(req.params.id))
  res.json(pedido)
}

export async function confirmarPagamento(req: Request, res: Response) {
  const result = confirmarPagamentoSchema.safeParse(req.body)
  if (!result.success) throw new AppError(result.error.issues[0].message)

  const pedido = await pedidoService.confirmarPagamento(
    Number(req.params.id),
    result.data.aprovado,
  )
  res.json(pedido)
}
