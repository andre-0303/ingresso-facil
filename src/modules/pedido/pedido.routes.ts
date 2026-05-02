import { Router } from 'express'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import { criarPedido, buscarPedido, confirmarPagamento } from './pedido.controller.js'

export const pedidoRoutes = Router()

pedidoRoutes.get('/:id', asyncHandler(buscarPedido))
pedidoRoutes.post('/', asyncHandler(criarPedido))

// Simula webhook do gateway de pagamento
pedidoRoutes.post('/:id/pagamento', asyncHandler(confirmarPagamento))
