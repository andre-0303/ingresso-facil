import { pool } from '../../database/pool.js'
import { AppError } from '../../shared/errors/AppError.js'
import type { Pedido } from '../../shared/types/index.js'
import type { CriarPedidoInput } from './pedido.schema.js'

const LIMITE_INGRESSOS_POR_CPF = 5
const TEMPO_RESERVA_MS = 15 * 60 * 1000 // 15 minutos

export async function criarPedido(data: CriarPedidoInput): Promise<Pedido> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Verifica limite de 5 ingressos por usuário neste show
    const { rows: limitRows } = await client.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM ingresso i
       JOIN pedido p ON p.id = i.pedido_id
       WHERE p.usuario_id = $1
         AND i.id_show = $2
         AND i.status != 'DISPONIVEL'`,
      [data.usuario_id, data.show_id],
    )
    const jaReservados = Number(limitRows[0].total)
    if (jaReservados + data.quantidade > LIMITE_INGRESSOS_POR_CPF) {
      throw new AppError(
        `Limite de ${LIMITE_INGRESSOS_POR_CPF} ingressos por usuário neste show. Você já tem ${jaReservados}.`,
        422,
      )
    }

    // Bloqueia ingressos disponíveis atomicamente (SKIP LOCKED evita deadlock entre transações concorrentes)
    const { rows: ingressos } = await client.query<{ id: number }>(
      `SELECT id FROM ingresso
       WHERE id_show = $1 AND status = 'DISPONIVEL'
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [data.show_id, data.quantidade],
    )

    if (ingressos.length < data.quantidade) {
      throw new AppError(
        `Ingressos insuficientes. Disponíveis: ${ingressos.length}, solicitados: ${data.quantidade}.`,
        409,
      )
    }

    // Cria pedido
    const { rows: pedidoRows } = await client.query<Pedido>(
      `INSERT INTO pedido (usuario_id, metodo_pagamento_id, status_pagamento)
       VALUES ($1, $2, 'PENDENTE')
       RETURNING *`,
      [data.usuario_id, data.metodo_pagamento_id],
    )
    const pedido = pedidoRows[0]

    // Associa ingressos ao pedido e marca como RESERVADO
    const ingressoIds = ingressos.map((i) => i.id)
    await client.query(
      `UPDATE ingresso
       SET status = 'RESERVADO', pedido_id = $1
       WHERE id = ANY($2::int[])`,
      [pedido.id, ingressoIds],
    )

    await client.query('COMMIT')

    // Libera reserva automaticamente após timeout se pagamento não confirmar
    setTimeout(() => liberarReservaExpirada(pedido.id), TEMPO_RESERVA_MS)

    return pedido
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function confirmarPagamento(pedidoId: number, aprovado: boolean): Promise<Pedido> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: pedidoRows } = await client.query<Pedido>(
      `SELECT * FROM pedido WHERE id = $1 FOR UPDATE`,
      [pedidoId],
    )
    const pedido = pedidoRows[0]
    if (!pedido) throw new AppError('Pedido não encontrado', 404)
    if (pedido.status_pagamento !== 'PENDENTE') {
      throw new AppError(`Pedido já processado: ${pedido.status_pagamento}`, 422)
    }

    if (aprovado) {
      await client.query(
        `UPDATE pedido SET status_pagamento = 'PAGO' WHERE id = $1`,
        [pedidoId],
      )
      await client.query(
        `UPDATE ingresso SET status = 'VENDIDO' WHERE pedido_id = $1`,
        [pedidoId],
      )
    } else {
      await client.query(
        `UPDATE pedido SET status_pagamento = 'RECUSADO' WHERE id = $1`,
        [pedidoId],
      )
      await client.query(
        `UPDATE ingresso SET status = 'DISPONIVEL', pedido_id = NULL WHERE pedido_id = $1`,
        [pedidoId],
      )
    }

    await client.query('COMMIT')

    const { rows } = await pool.query<Pedido>('SELECT * FROM pedido WHERE id = $1', [pedidoId])
    return rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function buscarPedidoPorId(id: number): Promise<Pedido> {
  const { rows } = await pool.query<Pedido>('SELECT * FROM pedido WHERE id = $1', [id])
  if (!rows[0]) throw new AppError('Pedido não encontrado', 404)
  return rows[0]
}

async function liberarReservaExpirada(pedidoId: number): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query<Pedido>(
      `SELECT * FROM pedido WHERE id = $1 AND status_pagamento = 'PENDENTE' FOR UPDATE`,
      [pedidoId],
    )
    if (!rows[0]) {
      await client.query('ROLLBACK')
      return
    }

    await client.query(
      `UPDATE pedido SET status_pagamento = 'RECUSADO' WHERE id = $1`,
      [pedidoId],
    )
    await client.query(
      `UPDATE ingresso SET status = 'DISPONIVEL', pedido_id = NULL WHERE pedido_id = $1`,
      [pedidoId],
    )

    await client.query('COMMIT')
    console.log(`Reserva expirada liberada — pedido ${pedidoId}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(`Erro ao liberar reserva do pedido ${pedidoId}:`, err)
  } finally {
    client.release()
  }
}
