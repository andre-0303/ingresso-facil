import { Router } from 'express'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import { criarUsuario, buscarUsuario, listarUsuarios } from './usuario.controller.js'

export const usuarioRoutes = Router()

usuarioRoutes.get('/', asyncHandler(listarUsuarios))
usuarioRoutes.get('/:id', asyncHandler(buscarUsuario))
usuarioRoutes.post('/', asyncHandler(criarUsuario))
