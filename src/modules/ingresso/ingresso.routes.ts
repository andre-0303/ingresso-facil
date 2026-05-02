import { Router } from 'express'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import { listarIngressos, buscarIngresso, validarIngresso } from './ingresso.controller.js'

export const ingressoRoutes = Router()

ingressoRoutes.get('/', asyncHandler(listarIngressos))          // ?showId=X
ingressoRoutes.get('/:id', asyncHandler(buscarIngresso))
ingressoRoutes.post('/:id/validar', asyncHandler(validarIngresso))
