import { pool } from '../../database/pool.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { Ingresso } from '../../shared/types/index.js'

export async function listarIngressosPorShow(showId: number): Promise<Ingresso[]> {
  const { rows } = await pool.query<Ingresso>(
    `SELECT * FROM ingresso WHERE id_show = $1 ORDER BY id`,
    [showId],
  )
  return rows
}

export async function buscarIngressoPorId(id: number): Promise<Ingresso> {
  const { rows } = await pool.query<Ingresso>(
    'SELECT * FROM ingresso WHERE id = $1',
    [id],
  )
  if (!rows[0]) throw new AppError('Ingresso não encontrado', 404)
  return rows[0]
}

export async function validarIngresso(id: number): Promise<Ingresso> {
  const { rows } = await pool.query<Ingresso>(
    `SELECT * FROM ingresso WHERE id = $1`,
    [id],
  )
  const ingresso = rows[0]
  if (!ingresso) throw new AppError('Ingresso não encontrado', 404)
  if (ingresso.status !== 'VENDIDO') {
    throw new AppError(`Ingresso inválido para entrada. Status: ${ingresso.status}`, 422)
  }
  return ingresso
}
