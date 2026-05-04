import type { Request, Response } from 'express'
import { criarShowSchema, adicionarIngressosSchema } from './show.schema.js'
import * as showService from './show.service.js'
import { AppError } from '../../shared/errors/AppError.js'

export async function criarShow(req: Request, res: Response) {
  const result = criarShowSchema.safeParse(req.body)
  if (!result.success) throw new AppError(result.error.issues[0].message)

  const show = await showService.criarShow(result.data)
  res.status(201).json(show)
}

export async function listarShows(_req: Request, res: Response) {
  const shows = await showService.listarShows()
  res.json(shows)
}

export async function buscarShow(req: Request, res: Response) {
  const show = await showService.buscarShowPorId(Number(req.params.id))
  res.json(show)
}

export async function adicionarIngressos(req: Request, res: Response) {
  const result = adicionarIngressosSchema.safeParse(req.body)
  if (!result.success) throw new AppError(result.error.issues[0].message)

  const show = await showService.adicionarIngressos(Number(req.params.id), result.data)
  res.json(show)
}
