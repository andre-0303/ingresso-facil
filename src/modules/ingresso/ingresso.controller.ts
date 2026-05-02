import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors/AppError.js'
import * as ingressoService from './ingresso.service.js'

export async function listarIngressos(req: Request, res: Response) {
  const showId = req.query.showId
  if (!showId || isNaN(Number(showId))) {
    throw new AppError('Query param showId obrigatório e deve ser número')
  }
  const ingressos = await ingressoService.listarIngressosPorShow(Number(showId))
  res.json(ingressos)
}

export async function buscarIngresso(req: Request, res: Response) {
  const ingresso = await ingressoService.buscarIngressoPorId(Number(req.params.id))
  res.json(ingresso)
}

export async function validarIngresso(req: Request, res: Response) {
  const ingresso = await ingressoService.validarIngresso(Number(req.params.id))
  res.json({ valido: true, ingresso })
}
