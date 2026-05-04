import { pool } from '../../database/pool.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { Show } from '../../shared/types/index.js'
import type { CriarShowInput, AdicionarIngressosInput } from './show.schema.js'

export async function criarShow(data: CriarShowInput): Promise<Show> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: showRows } = await client.query<Show>(
      'INSERT INTO show (nome, data, local) VALUES ($1, $2, $3) RETURNING *',
      [data.nome, data.data, data.local],
    )
    const show = showRows[0]

    // Cria ingressos pré-alocados com status DISPONIVEL
    const placeholders = Array.from(
      { length: data.quantidade_ingressos },
      (_) => `($1, $2, 'DISPONIVEL')`,
    ).join(', ')

    await client.query(
      `INSERT INTO ingresso (id_show, preco, status) VALUES ${placeholders}`,
      [show.id, data.preco_ingresso],
    )

    await client.query('COMMIT')
    return show
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function listarShows(): Promise<(Show & { ingressos_disponiveis: number })[]> {
  const { rows } = await pool.query(`
    SELECT s.*, COUNT(i.id) FILTER (WHERE i.status = 'DISPONIVEL') AS ingressos_disponiveis
    FROM show s
    LEFT JOIN ingresso i ON i.id_show = s.id
    GROUP BY s.id
    ORDER BY s.data
  `)
  return rows
}

export async function buscarShowPorId(id: number): Promise<Show & { ingressos_disponiveis: number }> {
  const { rows } = await pool.query(`
    SELECT s.*, COUNT(i.id) FILTER (WHERE i.status = 'DISPONIVEL') AS ingressos_disponiveis
    FROM show s
    LEFT JOIN ingresso i ON i.id_show = s.id
    WHERE s.id = $1
    GROUP BY s.id
  `, [id])

  if (!rows[0]) throw new AppError('Show não encontrado', 404)
  return rows[0]
}

export async function adicionarIngressos(showId: number, data: AdicionarIngressosInput): Promise<Show & { ingressos_disponiveis: number }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: showRows } = await client.query<Show>('SELECT * FROM show WHERE id = $1', [showId])
    if (!showRows[0]) throw new AppError('Show não encontrado', 404)

    const placeholders = Array.from({ length: data.quantidade }, () => `($1, $2, 'DISPONIVEL')`).join(', ')
    await client.query(
      `INSERT INTO ingresso (id_show, preco, status) VALUES ${placeholders}`,
      [showId, data.preco_ingresso],
    )

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return buscarShowPorId(showId)
}
