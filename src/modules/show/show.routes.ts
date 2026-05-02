import { Router } from 'express'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import { criarShow, listarShows, buscarShow } from './show.controller.js'

export const showRoutes = Router()

showRoutes.get('/', asyncHandler(listarShows))
showRoutes.get('/:id', asyncHandler(buscarShow))
showRoutes.post('/', asyncHandler(criarShow))
