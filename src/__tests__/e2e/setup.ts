import { pool } from '../../database/pool.js'

export async function truncateAll() {
  // metodo_pagamento é lookup table, não truncar
  await pool.query(
    'TRUNCATE ingresso, pedido, show, usuario RESTART IDENTITY CASCADE',
  )
}

export async function closePool() {
  await pool.end()
}

// Retorna o id do método PIX (sempre id=3 após migration)
export async function getMetodoPagamentoId(tipo = 'PIX'): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `SELECT id FROM metodo_pagamento WHERE tipo_pagamento = $1`,
    [tipo],
  )
  return rows[0].id
}
