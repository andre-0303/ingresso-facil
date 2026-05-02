import type { Request, Response } from 'express'
import { criarUsuarioSchema } from './usuario.schema.js'
import * as usuarioService from './usuario.service.js'
import { AppError } from '../../shared/errors/AppError.js'

export async function criarUsuario(req: Request, res: Response) {
  const result = criarUsuarioSchema.safeParse(req.body)
  if (!result.success) throw new AppError(result.error.issues[0].message)

  const usuario = await usuarioService.criarUsuario(result.data)
  res.status(201).json(usuario)
}

export async function buscarUsuario(req: Request, res: Response) {
  const id = Number(req.params.id)
  const usuario = await usuarioService.buscarUsuarioPorId(id)
  res.json(usuario)
}

export async function listarUsuarios(_req: Request, res: Response) {
  const usuarios = await usuarioService.listarUsuarios()
  res.json(usuarios)
}
